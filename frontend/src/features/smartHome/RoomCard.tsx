import { Card } from '../../design-system';
import type { Room } from './smartHomeService';
import { RoomStatusBadge } from './RoomStatusBadge';
import { roomIcon } from './smartHomeFormat';

export interface RoomCardProps {
  room: Room;
  selected?: boolean;
  onSelect: (roomId: string) => void;
}

/** A room overview tile — name, device count, and aggregate power status.
 *  Selecting it filters the Devices section to this room (never opens a
 *  drawer — there is no separate room detail view in this step). */
export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  const Icon = roomIcon(room.icon);

  return (
    <Card
      variant="raised"
      interactive
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(room.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(room.id);
        }
      }}
      className={selected ? 'flex flex-col gap-3 p-4 ring-2 ring-accent-ring' : 'flex flex-col gap-3 p-4'}
      data-testid={`room-card-${room.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-ai-aura [&_svg]:size-5">
            <Icon aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body font-semibold text-content">{room.name}</span>
            <span className="text-caption text-content-tertiary">
              {room.deviceCount} {room.deviceCount === 1 ? 'device' : 'devices'}
            </span>
          </div>
        </div>
      </div>
      <div>
        <RoomStatusBadge status={room.status} />
      </div>
    </Card>
  );
}
