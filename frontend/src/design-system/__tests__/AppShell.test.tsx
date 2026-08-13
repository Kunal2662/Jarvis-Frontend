import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '../layouts/AppShell/AppShell';

/**
 * Step 24 — keyboard users previously had to tab through every topbar
 * control (search, voice, notifications, appearance, settings, avatar)
 * before reaching page content on every single route. A skip link is the
 * standard fix (WCAG 2.4.1 Bypass Blocks); it must be the first focusable
 * element and must move real keyboard focus to <main>, not just scroll to it.
 */
describe('AppShell skip link', () => {
  it('renders a skip link targeting a focusable main landmark', () => {
    render(
      <AppShell topbar={<div>Topbar</div>}>
        <p>Page content</p>
      </AppShell>,
    );
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const main = screen.getByText('Page content').closest('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('is visually hidden until focused', () => {
    render(
      <AppShell topbar={<div>Topbar</div>}>
        <p>Page content</p>
      </AppShell>,
    );
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toHaveClass('sr-only');
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });
});
