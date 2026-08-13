import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { VoiceOverlay } from '../VoiceOverlay';

function renderOverlay(open: boolean) {
  return render(
    <MemoryRouter>
      <VoiceOverlay open={open} onOpenChange={() => {}} />
    </MemoryRouter>,
  );
}

/**
 * Step 23 — VoiceOverlay now flanks the real orb with the same reactive
 * Waveform Home's hero uses (cross-surface visual coherence), reusing the
 * overlay's own already-computed live `state` — no new logic. Previously
 * untested; this adds a baseline smoke test for the surface this step
 * actually changed.
 */
describe('VoiceOverlay', () => {
  it('renders the orb dialog with its flanking ambient waves when open', () => {
    renderOverlay(true);
    const dialog = screen.getByRole('dialog', { name: 'Voice session' });
    expect(dialog).toBeInTheDocument();
    // Waveform bar containers are aria-hidden (decorative) — assert both
    // flanking containers rendered their bars.
    const waveBars = dialog.querySelectorAll('[aria-hidden="true"] > span');
    expect(waveBars.length).toBeGreaterThan(0);
  });

  it('renders nothing when closed', () => {
    renderOverlay(false);
    expect(screen.queryByRole('dialog', { name: 'Voice session' })).not.toBeInTheDocument();
  });
});
