import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Lock, ShieldAlert } from 'lucide-react';
import { Badge, Button, Card } from '../../../design-system';

/**
 * Privacy settings — informational plus a real link into Memory. No
 * frontend toggle here claims to change Core-side data retention, because
 * no verified Core contract for that exists anywhere in this checkpoint
 * (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md). Building a toggle with no
 * real backing would misrepresent what this frontend can actually do.
 */
export function PrivacySection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4" data-testid="settings-privacy">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2.5">
          <Lock className="size-5 text-content-secondary" aria-hidden="true" />
          <span className="text-body font-semibold text-content">What's stored, and where</span>
        </div>
        <p className="text-body-sm text-content-secondary">
          Everything in this checkpoint — your appearance preferences, this notification setting, and every
          feature's mock data (Automations, Smart Home, Memory, Agents, and so on) — lives only in this
          browser. Nothing is sent to a server, and nothing is shared between devices.
        </p>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2.5">
          <Brain className="size-5 text-content-secondary" aria-hidden="true" />
          <span className="text-body font-semibold text-content">What Jarvis remembers</span>
        </div>
        <p className="text-body-sm text-content-secondary">
          Review and forget individual memories any time from the Memory page.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => navigate('/memory')}
          rightIcon={<ArrowRight className="size-4" />}
        >
          Manage stored memories
        </Button>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="size-5 text-content-secondary" aria-hidden="true" />
            <span className="text-body font-semibold text-content">Core-controlled data retention</span>
          </div>
          <Badge variant="neutral" size="sm">
            Unavailable
          </Badge>
        </div>
        <p className="text-body-sm text-content-secondary">
          JARVIS Core does not yet document a data-retention or deletion contract for this checkpoint to
          call, so no such control is offered here — see{' '}
          <code className="rounded bg-surface-inset px-1 py-0.5 text-caption">
            docs/CORE_SETTINGS_CONTRACT_REQUIRED.md
          </code>
          .
        </p>
      </Card>
    </div>
  );
}
