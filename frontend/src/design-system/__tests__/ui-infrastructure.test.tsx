import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StateView } from '../composites/StateView/StateView';
import { Widget } from '../composites/Widget/Widget';

describe('global UI infrastructure — StateView', () => {
  it('renders children when ready', () => {
    render(<StateView status="ready"><p>real content</p></StateView>);
    expect(screen.getByText('real content')).toBeInTheDocument();
  });

  it('shows a spinner on loading', () => {
    render(<StateView status="loading" loadingLabel="Fetching…" />);
    expect(screen.getByText('Fetching…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the coming-soon preset', () => {
    render(<StateView status="coming-soon" />);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('renders a Retry button on error and fires onRetry', () => {
    const onRetry = vi.fn();
    render(<StateView status="error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('global UI infrastructure — Widget', () => {
  it('renders title and content when ready', () => {
    render(<Widget title="System">nominal</Widget>);
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('nominal')).toBeInTheDocument();
  });

  it('renders a loading state instead of content', () => {
    render(<Widget title="Activity" status="loading">hidden</Widget>);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
