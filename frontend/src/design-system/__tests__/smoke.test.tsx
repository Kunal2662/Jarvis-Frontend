import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Kbd,
  Progress,
  Skeleton,
  Spinner,
  StatCard,
  ThemeProvider,
  TooltipProvider,
  VoiceOrb,
} from '@/design-system';

function wrap(ui: React.ReactNode) {
  return render(
    <ThemeProvider>
      <TooltipProvider>{ui}</TooltipProvider>
    </ThemeProvider>,
  );
}

describe('design-system smoke render', () => {
  it('renders Button', () => {
    wrap(<Button>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('renders IconButton with accessible label', () => {
    wrap(
      <IconButton label="Add">
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders feedback + display primitives', () => {
    wrap(
      <>
        <Badge>New</Badge>
        <Input placeholder="type" />
        <Spinner />
        <Skeleton className="h-4 w-10" />
        <Progress value={50} />
        <Avatar fallback="TS" />
        <Kbd>K</Kbd>
      </>,
    );
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('type')).toBeInTheDocument();
  });

  it('renders Card, StatCard, EmptyState', () => {
    wrap(
      <>
        <Card>content</Card>
        <StatCard label="Agents" value={12} />
        <EmptyState title="Nothing here" description="Add something" />
      </>,
    );
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the JARVIS VoiceOrb across all states', () => {
    const states = ['idle', 'listening', 'thinking', 'speaking', 'processing', 'offline'] as const;
    for (const s of states) {
      const { unmount } = wrap(<VoiceOrb state={s} onClick={() => {}} label={`orb-${s}`} />);
      expect(screen.getByRole('button', { name: `orb-${s}` })).toBeInTheDocument();
      unmount();
    }
  });
});
