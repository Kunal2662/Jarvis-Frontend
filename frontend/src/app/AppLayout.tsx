import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bot,
  Calendar,
  Command,
  Gauge,
  Minus,
  Network,
  Settings,
  Sparkles,
  Square,
  SquareCheck,
  StickyNote,
  Wifi,
  X,
} from 'lucide-react';
import {
  AppShell,
  Avatar,
  Badge,
  Breadcrumb,
  CommandPalette,
  Dock,
  IconButton,
  NotificationCenter,
  QuickSettings,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  StatusBar,
  StatusItem,
  TopBar,
  useHotkey,
  useToast,
  VoiceOrb,
  type CommandGroup,
  type NotificationGroup,
} from '../design-system';
import { moduleByPath, moduleGroups, modules } from './modules';
import { VoiceOverlay } from '../features/voice/VoiceOverlay';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const { toast } = useToast();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useHotkey('mod+k', (e) => {
    e.preventDefault();
    setPaletteOpen(true);
  });
  useHotkey('mod+j', (e) => {
    e.preventDefault();
    setVoiceOpen(true);
  });

  const current = moduleByPath(location.pathname);
  const isHome = location.pathname === '/';
  const hour = clock.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const timeStr = clock.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const dateStr = clock.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const commandGroups: CommandGroup[] = useMemo(
    () => [
      {
        heading: 'Navigate',
        items: modules.map((m) => ({
          id: m.path,
          label: m.label,
          icon: <m.icon />,
          hint: m.ready ? undefined : 'soon',
          onSelect: () => navigate(m.path),
        })),
      },
      {
        heading: 'Actions',
        items: [
          {
            id: 'voice',
            label: 'Start voice session',
            icon: <Sparkles />,
            shortcut: '⌘J',
            onSelect: () => setVoiceOpen(true),
          },
          {
            id: 'chat',
            label: 'New chat with Jarvis',
            icon: <Bot />,
            onSelect: () => navigate('/chat'),
          },
        ],
      },
    ],
    [navigate],
  );

  const notifGroups: NotificationGroup[] = [
    {
      label: 'Today',
      items: [
        { id: '1', title: 'Research Agent finished', description: 'Summary ready to review.', time: '2m ago', icon: <Bot />, unread: true, onClick: () => navigate('/chat') },
        { id: '2', title: 'Memory synced', description: '1,204 items indexed.', time: '1h ago', icon: <Sparkles /> },
      ],
    },
    {
      label: 'Earlier',
      items: [{ id: '3', title: 'Calendar updated', description: '3 events added.', time: 'Yesterday', icon: <Calendar /> }],
    },
  ];

  const dockItems = [
    { id: 'notes', icon: <StickyNote />, label: 'Notes', onClick: () => navigate('/notes') },
    { id: 'tasks', icon: <SquareCheck />, label: 'Tasks', onClick: () => navigate('/tasks') },
    { id: 'graph', icon: <Network />, label: 'Graph', onClick: () => navigate('/graph') },
    { id: 'monitor', icon: <Gauge />, label: 'Monitor', onClick: () => navigate('/performance') },
  ].map((d) => ({ ...d, active: location.pathname === `/${d.id}` }));

  return (
    <AppShell
      sidebar={
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          header={
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 outline-none">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft shadow-glow-sm">
                <Sparkles className="size-4 text-ai-aura" />
              </div>
              {!collapsed && <span className="font-display text-h3 tracking-tight text-content">JARVIS</span>}
            </button>
          }
          footer={<SidebarItem icon={<Avatar size="xs" fallback="TS" />} label="Tony Stark" />}
        >
          {moduleGroups.map((group) => (
            <SidebarGroup key={group} label={group}>
              {modules
                .filter((m) => m.group === group)
                .map((m) => (
                  <SidebarItem
                    key={m.path}
                    icon={<m.icon />}
                    label={m.label}
                    active={location.pathname === m.path}
                    badge={m.badge ? <Badge variant="accent" size="sm">{m.badge}</Badge> : undefined}
                    onClick={() => (m.action === 'voice' ? setVoiceOpen(true) : navigate(m.path))}
                  />
                ))}
            </SidebarGroup>
          ))}
        </Sidebar>
      }
      topbar={
        <TopBar
          onSearchClick={() => setPaletteOpen(true)}
          leading={
            isHome ? (
              <div className="flex flex-col leading-tight">
                <span className="flex items-center gap-1.5 text-body-sm font-semibold text-content">
                  {greeting}, Tony
                  <span className="text-content-tertiary">·</span>
                  <span className="tabular-nums text-content-secondary">{timeStr}</span>
                </span>
                <span className="text-caption text-content-tertiary">{dateStr}</span>
              </div>
            ) : (
              <Breadcrumb
                items={[{ label: 'JARVIS', onClick: () => navigate('/') }, { label: current?.label ?? 'Home' }]}
              />
            )
          }
          trailing={
            <>
              <div className="mr-1 hidden items-center gap-3 lg:flex">
                <StatusItem icon={<Wifi />} tone="success">Connected</StatusItem>
                <span className="flex items-center gap-1.5 text-caption text-content-secondary">
                  <span className="size-1.5 animate-pulse rounded-full bg-ai-aura" />
                  Jarvis ready
                </span>
              </div>
              <IconButton label="Voice (⌘J)" data-testid="open-voice" onClick={() => setVoiceOpen(true)}>
                <Sparkles className="size-[18px] text-ai-aura" />
              </IconButton>
              <IconButton label="Notifications" data-testid="open-notifications" onClick={() => setNotifOpen(true)}>
                <span className="relative">
                  <Bell className="size-[18px]" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-surface-base" />
                </span>
              </IconButton>
              <QuickSettings
                trigger={
                  <IconButton label="Quick settings" data-testid="open-quick-settings">
                    <Settings className="size-[18px]" />
                  </IconButton>
                }
              />
              <Avatar size="sm" fallback="TS" status="online" />
              <div className="ml-1 hidden items-center gap-1 xl:flex" aria-label="Window controls">
                <IconButton label="Minimize" size="sm"><Minus className="size-4" /></IconButton>
                <IconButton label="Maximize" size="sm"><Square className="size-3.5" /></IconButton>
                <IconButton label="Close" size="sm" className="hover:bg-danger-soft hover:text-danger"><X className="size-4" /></IconButton>
              </div>
            </>
          }
        />
      }
      statusbar={
        <StatusBar
          left={
            <>
              <StatusItem icon={<span className="size-2 rounded-full bg-success" />} tone="success">All systems nominal</StatusItem>
              <StatusItem icon={<Bot />}>12 agents</StatusItem>
            </>
          }
          right={<StatusItem icon={<Command />}>⌘K · ⌘J voice</StatusItem>}
        />
      }
      overlay={
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-sticky flex justify-center">
            <div className="pointer-events-auto">
              <Dock items={dockItems} />
            </div>
          </div>
          <div className="absolute bottom-6 right-6 z-voice">
            <VoiceOrb size={56} state="idle" onClick={() => setVoiceOpen(true)} label="Open voice session" />
          </div>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            groups={commandGroups}
            query={query}
            onQueryChange={setQuery}
            onAskJarvis={(q) => {
              navigate('/chat', { state: { prompt: q } });
              toast({ title: 'Asking Jarvis', description: q, variant: 'ai' });
            }}
          />
          <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} groups={notifGroups} onMarkAllRead={() => {}} />
          <VoiceOverlay open={voiceOpen} onOpenChange={setVoiceOpen} />
        </>
      }
    >
      <Outlet context={{ openVoice: () => setVoiceOpen(true) }} />
    </AppShell>
  );
}
