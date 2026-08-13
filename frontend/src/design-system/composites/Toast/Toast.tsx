import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Sparkles, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger' | 'ai';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Toast enter/exit motion — instant and offset-free when motion is reduced. */
// eslint-disable-next-line react-refresh/only-export-components
export function toastMotionProps(reduced: boolean) {
  return {
    layout: !reduced,
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 },
    transition: reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 480, damping: 34 },
  };
}

const icons: Record<ToastVariant, ReactNode> = {
  info: <Info className="size-4 text-info" />,
  success: <CheckCircle2 className="size-4 text-success" />,
  warning: <AlertTriangle className="size-4 text-warning" />,
  danger: <XCircle className="size-4 text-danger" />,
  ai: <Sparkles className="size-4 text-ai-aura" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const reduced = useReducedMotion();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = crypto.randomUUID();
      const item: ToastItem = { id, variant: 'info', duration: 5000, ...opts };
      setToasts((prev) => [...prev.slice(-2), item]);
      if (item.duration && item.duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            role="region"
            aria-label="Notifications"
            className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
          >
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  {...toastMotionProps(reduced)}
                  className={cn(
                    'glass glass-thin pointer-events-auto flex items-start gap-3 rounded-lg p-3.5 shadow-e3',
                    t.variant === 'ai' && 'shadow-glow-sm',
                  )}
                  role={t.variant === 'danger' ? 'alert' : 'status'}
                >
                  <span className="mt-0.5 shrink-0">{icons[t.variant ?? 'info']}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body-sm font-medium text-content">{t.title}</span>
                    {t.description && (
                      <span className="text-caption text-content-secondary">{t.description}</span>
                    )}
                    {t.action && (
                      <button
                        onClick={() => {
                          t.action?.onClick();
                          dismiss(t.id);
                        }}
                        className="mt-1 self-start text-caption font-medium text-accent-text hover:underline"
                      >
                        {t.action.label}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded-sm text-content-tertiary transition-colors hover:text-content"
                  >
                    <X className="size-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
