import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom lacks matchMedia (used by ThemeProvider + hooks)
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

// Radix relies on these APIs not present in jsdom
if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

// jsdom lacks CSS.supports (used by glass capability detection)
const cssGlobal = (globalThis as { CSS?: { supports?: (...a: string[]) => boolean } }).CSS;
if (!cssGlobal) vi.stubGlobal('CSS', { supports: () => false });
else if (!cssGlobal.supports) cssGlobal.supports = () => false;
