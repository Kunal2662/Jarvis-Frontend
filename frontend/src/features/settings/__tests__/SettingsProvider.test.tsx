import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from '../SettingsProvider';

function Probe() {
  const { settings, loading, update, reset } = useSettings();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="notifications-enabled">{String(settings.notificationsEnabled)}</span>
      <button onClick={() => update({ notificationsEnabled: false })}>disable</button>
      <button onClick={() => reset()}>reset</button>
    </div>
  );
}

describe('SettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads settings on mount and exposes them via useSettings()', async () => {
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('notifications-enabled')).toHaveTextContent('true');
  });

  it('update() persists a change and re-renders consumers with the new value', async () => {
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await act(async () => {
      screen.getByText('disable').click();
    });

    await waitFor(() => expect(screen.getByTestId('notifications-enabled')).toHaveTextContent('false'));
  });

  it('reset() restores the default after a change', async () => {
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await act(async () => {
      screen.getByText('disable').click();
    });
    await waitFor(() => expect(screen.getByTestId('notifications-enabled')).toHaveTextContent('false'));

    await act(async () => {
      screen.getByText('reset').click();
    });
    await waitFor(() => expect(screen.getByTestId('notifications-enabled')).toHaveTextContent('true'));
  });

  it('useSettings() outside a provider falls back to safe defaults rather than throwing', () => {
    // Deliberately NOT wrapped in <SettingsProvider> — mirrors every
    // pre-existing feature test file that renders AppLayout without one
    // (see SettingsProvider.tsx's module doc for why this must not throw).
    expect(() => render(<Probe />)).not.toThrow();
    expect(screen.getByTestId('notifications-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});
