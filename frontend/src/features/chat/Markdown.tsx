import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../design-system';

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-line-subtle bg-surface-inset">
      <button
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-surface-raised text-content-tertiary opacity-0 transition-opacity hover:text-content group-hover:opacity-100"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-body-sm text-content">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** Rich markdown renderer styled to the JARVIS reading surface. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className={cn('flex flex-col gap-2 text-body leading-relaxed text-content')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="text-h2 text-content" {...p} />,
          h2: (p) => <h2 className="text-h3 text-content" {...p} />,
          h3: (p) => <h3 className="text-body-lg font-semibold text-content" {...p} />,
          p: (p) => <p className="text-body text-content" {...p} />,
          ul: (p) => <ul className="ml-5 list-disc space-y-1 text-body text-content" {...p} />,
          ol: (p) => <ol className="ml-5 list-decimal space-y-1 text-body text-content" {...p} />,
          a: (p) => <a className="text-accent-text underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />,
          strong: (p) => <strong className="font-semibold text-content" {...p} />,
          blockquote: (p) => <blockquote className="border-l-2 border-accent pl-3 text-content-secondary" {...p} />,
          table: (p) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-line-subtle">
              <table className="w-full text-body-sm" {...p} />
            </div>
          ),
          th: (p) => <th className="border-b border-line-subtle bg-surface-subtle px-3 py-2 text-left text-overline uppercase text-content-tertiary" {...p} />,
          td: (p) => <td className="border-b border-line-subtle px-3 py-2 text-content" {...p} />,
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? '');
            if (isBlock) return <CodeBlock>{String(children).replace(/\n$/, '')}</CodeBlock>;
            return (
              <code className="rounded-[5px] bg-surface-inset px-1.5 py-0.5 font-mono text-[0.85em] text-accent-text" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
