import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Waveform } from '../patterns/Waveform/Waveform';
import { stateColor, type VoiceState } from '../patterns/VoiceOrb/VoiceOrb';

const STATES: VoiceState[] = ['idle', 'listening', 'thinking', 'speaking', 'processing', 'offline'];

/**
 * Step 23 — the waves flanking the JARVIS orb must actually react to its
 * state (color, energy), never a single generic ambient loop indifferent to
 * what JARVIS is doing. These tests assert the real, static-per-render
 * contract (color, opacity, layout) rather than framer-motion's animated
 * values, which aren't reliably observable in jsdom.
 */
describe('Waveform', () => {
  it('renders the requested number of bars', () => {
    const { container } = render(<Waveform bars={12} state="idle" />);
    expect(container.querySelectorAll('span').length).toBe(12);
  });

  it.each(STATES)('colors every bar with the exact same stateColor VoiceOrb uses for "%s"', (state) => {
    const { container } = render(<Waveform bars={4} state={state} />);
    const bars = Array.from(container.querySelectorAll('span'));
    expect(bars.length).toBe(4);
    for (const bar of bars) {
      expect((bar as HTMLElement).style.background).toBe(stateColor[state]);
    }
  });

  it('dims bar opacity when offline — visually distinct from every listening/thinking/speaking state', () => {
    const { container: offlineContainer } = render(<Waveform bars={4} state="offline" />);
    const offlineBar = offlineContainer.querySelector('span') as HTMLElement;
    expect(offlineBar.style.opacity).toBe('0.2');

    for (const state of STATES.filter((s) => s !== 'offline')) {
      const { container } = render(<Waveform bars={4} state={state} />);
      const bar = container.querySelector('span') as HTMLElement;
      expect(bar.style.opacity).not.toBe('0.2');
    }
  });

  it('mirrors bar order via row-reverse when mirror is set', () => {
    const { container } = render(<Waveform state="idle" mirror />);
    expect(container.firstElementChild).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('is purely decorative — aria-hidden, never announced as content', () => {
    const { container } = render(<Waveform state="listening" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to idle when no state is given', () => {
    const { container } = render(<Waveform bars={2} />);
    const bar = container.querySelector('span') as HTMLElement;
    expect(bar.style.background).toBe(stateColor.idle);
  });

  it('spans the full container width edge-to-edge instead of a small cluster huddled at one end', () => {
    const { container } = render(<Waveform state="idle" />);
    expect(container.firstElementChild).toHaveStyle({ width: '100%', justifyContent: 'space-between' });
  });
});
