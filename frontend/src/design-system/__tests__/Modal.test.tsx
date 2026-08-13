import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal, ModalContent, ModalTitle } from '../primitives/Modal/Modal';

/**
 * Step 24 — a Modal whose content is taller than the viewport (e.g. the
 * Automations/Calendar/Tasks/Notes "lg" create/edit forms) must never grow
 * past it. Before this fix `ModalContent` had no max-height or scroll, so on
 * a short/mobile viewport the footer actions (Cancel/Save) could render
 * entirely off-screen with no way to reach them — confirmed live at
 * 375x812. These tests assert the fixed contract rather than exact pixel
 * values, since jsdom doesn't do real layout.
 */
describe('ModalContent', () => {
  it('caps its height to the viewport and scrolls internally instead of growing past it', () => {
    render(
      <Modal open>
        <ModalContent data-testid="modal">
          <ModalTitle>Example</ModalTitle>
          <div>Body</div>
        </ModalContent>
      </Modal>,
    );
    const modal = screen.getByTestId('modal');
    expect(modal).toHaveClass('max-h-[85vh]');
    expect(modal).toHaveClass('overflow-y-auto');
  });
});
