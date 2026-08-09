import { Button, Card } from '../../design-system';
import type { Scene } from './smartHomeService';
import { sceneIcon } from './smartHomeFormat';

export interface SceneCardProps {
  scene: Scene;
  highlighted?: boolean;
  triggering?: boolean;
  onTrigger: (scene: Scene) => void;
}

/** A pre-defined scene the frontend displays and can trigger — never
 *  authored, edited, or computed client-side (there is no scene builder in
 *  this step). `actions` are display-only summaries of what the scene does. */
export function SceneCard({ scene, highlighted, triggering, onTrigger }: SceneCardProps) {
  const Icon = sceneIcon(scene.icon);

  return (
    <Card
      variant="raised"
      className="flex flex-col gap-3 p-4"
      data-testid={`scene-card-${scene.id}`}
      data-highlighted={highlighted ? 'true' : undefined}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-ai-aura [&_svg]:size-5">
          <Icon aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body font-semibold text-content">{scene.name}</span>
          <span className="text-body-sm text-content-secondary">{scene.description}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1 border-t border-line-subtle pt-2 text-caption text-content-tertiary">
        {scene.actions.map((action, i) => (
          <li key={`${scene.id}-${i}`}>{action.summary}</li>
        ))}
      </ul>

      <Button
        variant="secondary"
        className="mt-auto self-start"
        onClick={() => onTrigger(scene)}
        loading={triggering}
        data-testid={`scene-trigger-${scene.id}`}
      >
        {triggering ? 'Triggering…' : 'Trigger'}
      </Button>
    </Card>
  );
}
