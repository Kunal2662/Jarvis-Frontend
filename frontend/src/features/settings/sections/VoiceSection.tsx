import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mic, Volume2 } from 'lucide-react';
import { Badge, Button, Card } from '../../../design-system';
import { getVoiceService } from '../../voice/voiceService';

/**
 * Voice settings — a read-only status view over the existing `VoiceService`
 * seam (features/voice/voiceService.ts). No microphone/speaker selection or
 * wake-word control is offered: no such control exists in the underlying
 * seam today, and a control with no real effect would be a fake toggle
 * (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md). "Start voice session"
 * reuses AppLayout's existing overlay via outlet context — no second voice
 * engine.
 */
export function VoiceSection() {
  const service = useMemo(() => getVoiceService(), []);
  const ctx = useOutletContext<{ openVoice?: () => void }>() ?? {};
  const openVoice = ctx.openVoice ?? (() => {});

  return (
    <div className="flex flex-col gap-4" data-testid="settings-voice">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mic className="size-5 text-content-secondary" aria-hidden="true" />
            <span className="text-body font-semibold text-content">{service.label}</span>
          </div>
          <Badge variant={service.ready ? 'success' : 'neutral'} size="sm">
            {service.ready ? 'Ready' : 'Local only'}
          </Badge>
        </div>
        <p className="text-body-sm text-content-secondary">
          Voice runs entirely in this browser via the Web Speech API — the same engine Chat and Voice
          already use. There is no separate voice configuration to manage here.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={service.capabilities.stt ? 'accent' : 'outline'} size="sm">
            Speech-to-text {service.capabilities.stt ? 'available' : 'unavailable'}
          </Badge>
          <Badge variant={service.capabilities.tts ? 'accent' : 'outline'} size="sm">
            <Volume2 className="size-3" />
            Text-to-speech {service.capabilities.tts ? 'available' : 'unavailable'}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" className="self-start" onClick={openVoice}>
          Start voice session
        </Button>
      </Card>
    </div>
  );
}
