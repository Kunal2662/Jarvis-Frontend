import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react';
import '../src/index.css';
import { TooltipProvider } from '../src/design-system/primitives/Tooltip/Tooltip';
import { ToastProvider } from '../src/design-system/composites/Toast/Toast';

const withTheme: Decorator = (Story, ctx) => {
  const theme = (ctx.globals.theme as string) ?? 'dark';
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute('data-theme', theme);
    r.setAttribute('data-density', 'comfortable');
    r.setAttribute('data-contrast', 'normal');
    r.setAttribute('data-glass', 'on');
  }, [theme]);
  return (
    <TooltipProvider>
      <ToastProvider>
        <div style={{ padding: 32, background: 'var(--surface-canvas)', minHeight: '100vh' }}>
          <Story />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'JARVIS theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
