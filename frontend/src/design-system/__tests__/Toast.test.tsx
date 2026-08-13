import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, toastMotionProps, useToast } from '../composites/Toast/Toast';

function Trigger() {
  const { toast } = useToast();
  return <button onClick={() => toast({ title: 'Automation enabled' })}>Fire toast</button>;
}

/**
 * Step 24 — every other Framer Motion consumer in the design system
 * (VoiceOrb, Waveform, ActivityTimeline, ChatPage) already checks
 * useReducedMotion before animating. Toast fires on nearly every user
 * action app-wide (Automations, Smart Home scenes, Notes/Tasks/Calendar
 * CRUD, ...) and was the one consumer that always ran its spring
 * enter/exit regardless of the user's OS-level motion preference.
 */
describe('toastMotionProps', () => {
  it('drops the spring and positional offsets when motion is reduced', () => {
    const props = toastMotionProps(true);
    expect(props.transition).toEqual({ duration: 0 });
    expect(props.initial).toEqual({ opacity: 0 });
    expect(props.exit).toEqual({ opacity: 0 });
    expect(props.layout).toBe(false);
  });

  it('keeps the spring entrance/exit motion when motion is not reduced', () => {
    const props = toastMotionProps(false);
    expect(props.transition).toMatchObject({ type: 'spring' });
    expect(props.initial).toMatchObject({ y: 16, scale: 0.96 });
    expect(props.exit).toMatchObject({ x: 24, scale: 0.96 });
    expect(props.layout).toBe(true);
  });
});

describe('Toast', () => {
  it('renders and dismisses a toast on click', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Fire toast' }));
    await screen.findByText('Automation enabled');
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => expect(screen.queryByText('Automation enabled')).not.toBeInTheDocument());
  });

  it('announces danger-variant toasts as an alert and others as status', async () => {
    function DangerTrigger() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast({ title: 'Sync failed', variant: 'danger' })}>Fire danger toast</button>
      );
    }
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <DangerTrigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Fire danger toast' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sync failed');
  });
});
