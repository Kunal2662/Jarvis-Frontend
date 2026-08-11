import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bot,
  Calendar,
  Command,
  Search,
  Settings,
  Sparkles,
  Wifi,
} from 'lucide-react';
import {
  AppShell,
  Avatar,
  CommandPalette,
  IconButton,
  NotificationCenter,
  QuickSettings,
  StatusBar,
  StatusItem,
  TopBar,
  TopNav,
  useHotkey,
  useToast,
  VoiceOrb,
  type CommandGroup,
  type NotificationGroup,
  type TopNavItem,
} from '../design-system';
import { comingSoonModules, liveSecondaryModules, settingsModules, topBarModules } from './modules';
import { VoiceOverlay } from '../features/voice/VoiceOverlay';
import { UniversalSearch } from '../features/search/UniversalSearch';
import { useSettings } from '../features/settings/SettingsProvider';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const { toast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ⌘K keeps its existing command-execution role (CommandPalette: actions +
  // "go to"). Universal Search (free-text search-everything, distinct
  // surface) gets its own shortcut so the two don't collide.
  useHotkey('mod+k', (e) => {
    e.preventDefault();
    setPaletteOpen(true);
  });
  useHotkey('mod+shift+k', (e) => {
    e.preventDefault();
    setSearchOpen(true);
  });
  useHotkey('mod+j', (e) => {
    e.preventDefault();
    setVoiceOpen(true);
  });

  const hour = clock.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const selectModule = (path: string, action?: 'voice') =>
    action === 'voice' ? setVoiceOpen(true) : navigate(path);

  // Flat top-bar navigation — one level, overflow scrolls (never a dropdown).
  const navItems: TopNavItem[] = topBarModules.map((m) => ({
    id: m.path.replace(/\W+/g, '') || 'home',
    label: m.label,
    icon: m.icon,
    badge: m.badge,
    active: location.pathname === m.path,
    onSelect: () => selectModule(m.path, m.action),
  }));

  const commandGroups: CommandGroup[] = useMemo(
    () => [
      {
        // Primary nav + real secondary pages (e.g. Knowledge, Intelligence) —
        // everything here is a live, built surface today.
        heading: 'Go to',
        items: [...topBarModules, ...liveSecondaryModules, ...settingsModules].map((m) => ({
          id: m.path,
          label: m.label,
          icon: <m.icon />,
          onSelect: () => selectModule(m.path, m.action),
        })),
      },
      {
        // Future surfaces — Core contract not yet wired to the frontend.
        // Clearly marked so nothing here looks production-ready.
        heading: 'Coming soon',
        items: comingSoonModules.map((m) => ({
          id: m.path,
          label: m.label,
          icon: <m.icon />,
          hint: 'soon',
          onSelect: () => selectModule(m.path, m.action),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, location.pathname],
  );

  // Gated by Settings → Notifications (`notificationsEnabled`, see
  // SettingsProvider) — a real, verifiable setting: turning it off empties
  // the bell menu and hides its unread badge, rather than a toggle with no
  // effect. See docs/CORE_SETTINGS_CONTRACT_REQUIRED.md.
  const notifGroups: NotificationGroup[] = !settings.notificationsEnabled ? [] : [
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

  const mobileTabs = topBarModules.slice(0, 5);

  return (
    <AppShell
      topbar={
        <TopBar
          nav={<div className="hidden md:flex min-w-0"><TopNav items={navItems} /></div>}
          leading={
            <button
              onClick={() => navigate('/')}
              data-testid="brand-home"
              className="flex items-center gap-2.5 outline-none"
              aria-label={`${greeting}, Tony — go to Home`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft shadow-glow-sm">
                <Sparkles className="size-4 text-ai-aura" />
              </div>
              <span className="hidden font-display text-h3 tracking-tight text-content sm:block">JARVIS</span>
            </button>
          }
          trailing={
            <>
              <div className="mr-1 hidden items-center gap-3 xl:flex">
                <StatusItem icon={<Wifi />} tone="success">Connected</StatusItem>
                <span className="flex items-center gap-1.5 text-caption text-content-secondary">
                  <span className="size-1.5 animate-pulse rounded-full bg-ai-aura" />
                  Jarvis ready
                </span>
              </div>
              <IconButton label="Search (⌘⇧K)" data-testid="open-search" onClick={() => setSearchOpen(true)}>
                <Search className="size-[18px]" />
              </IconButton>
              <IconButton label="Voice (⌘J)" data-testid="open-voice" onClick={() => setVoiceOpen(true)}>
                <Sparkles className="size-[18px] text-ai-aura" />
              </IconButton>
              <IconButton label="Notifications" data-testid="open-notifications" onClick={() => setNotifOpen(true)}>
                <span className="relative">
                  <Bell className="size-[18px]" />
                  {notifGroups.some((g) => g.items.some((i) => i.unread)) && (
                    <span
                      data-testid="notifications-unread-badge"
                      className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-surface-base"
                    />
                  )}
                </span>
              </IconButton>
              <QuickSettings
                trigger={
                  <IconButton label="Appearance" data-testid="open-quick-settings">
                    <span className="text-[18px] leading-none">◐</span>
                  </IconButton>
                }
              />
              <IconButton label="Settings" data-testid="open-settings" onClick={() => navigate('/settings')}>
                <Settings className="size-[18px]" />
              </IconButton>
              <Avatar size="sm" fallback="TS" status="online" />
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
          right={<StatusItem icon={<Command />}>⌘K · ⌘⇧K search · ⌘J voice</StatusItem>}
        />
      }
      overlay={
        <>
          {/* Mobile bottom tab strip (top 5 surfaces) — a platform convention, not a sidebar. */}
          <nav
            aria-label="Primary (mobile)"
            data-testid="mobile-tabbar"
            className="glass fixed inset-x-0 bottom-0 z-sticky flex items-stretch justify-around border-t border-line px-1 py-1.5 md:hidden"
          >
            {mobileTabs.map((m) => {
              const Icon = m.icon;
              const active = location.pathname === m.path;
              return (
                <button
                  key={m.path}
                  onClick={() => selectModule(m.path, m.action)}
                  data-testid={`mobile-tab-${m.path.replace(/\W+/g, '') || 'home'}`}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition-colors ${
                    active ? 'text-ai-aura' : 'text-content-tertiary'
                  }`}
                >
                  <Icon className="size-5" />
                  {m.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-6 right-6 z-voice mb-14 md:mb-0">
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
          <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} onOpenVoice={() => setVoiceOpen(true)} />
          <VoiceOverlay open={voiceOpen} onOpenChange={setVoiceOpen} />
        </>
      }
    >
      <Outlet context={{ openVoice: () => setVoiceOpen(true) }} />
    </AppShell>
  );
}
