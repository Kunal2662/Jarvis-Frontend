import {
  Activity,
  Blocks,
  Bot,
  Brain,
  Calendar,
  Component,
  FolderKanban,
  FolderOpen,
  Gauge,
  Globe,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessageSquare,
  Mic,
  Network,
  Settings,
  SquareCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

export interface ModuleDef {
  path: string;
  label: string;
  icon: LucideIcon;
  group: string;
  /** Built pages vs. "coming soon" placeholders. */
  ready?: boolean;
  badge?: string;
  /** Special sidebar behaviour instead of navigation. */
  action?: 'voice';
}

export const modules: ModuleDef[] = [
  { path: '/', label: 'Home', icon: LayoutDashboard, group: 'Overview', ready: true },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare, group: 'Overview', ready: true, badge: 'live' },
  { path: '/voice', label: 'Voice', icon: Mic, group: 'Overview', ready: true, action: 'voice' },

  { path: '/memory', label: 'Memory', icon: Brain, group: 'Intelligence' },
  { path: '/knowledge', label: 'Knowledge', icon: Network, group: 'Intelligence' },
  { path: '/agents', label: 'Agents', icon: Bot, group: 'Intelligence' },
  { path: '/automation', label: 'Automation', icon: Workflow, group: 'Intelligence' },

  { path: '/projects', label: 'Projects', icon: FolderKanban, group: 'Workspace' },
  { path: '/tasks', label: 'Tasks', icon: SquareCheck, group: 'Workspace' },
  { path: '/calendar', label: 'Calendar', icon: Calendar, group: 'Workspace' },
  { path: '/files', label: 'Files', icon: FolderOpen, group: 'Workspace' },
  { path: '/browser', label: 'Browser', icon: Globe, group: 'Workspace' },

  { path: '/google', label: 'Google Workspace', icon: Mail, group: 'Integrations' },
  { path: '/microsoft', label: 'Microsoft 365', icon: Blocks, group: 'Integrations' },
  { path: '/plugins', label: 'Plugins', icon: Blocks, group: 'Integrations' },

  { path: '/diagnostics', label: 'Diagnostics', icon: Activity, group: 'System' },
  { path: '/performance', label: 'Performance', icon: Gauge, group: 'System' },
  { path: '/settings', label: 'Settings', icon: Settings, group: 'System' },
  { path: '/design', label: 'Design System', icon: Component, group: 'System', ready: true },
];

export const moduleGroups = ['Overview', 'Intelligence', 'Workspace', 'Integrations', 'System'] as const;

export const aiIcon = Sparkles;

export function moduleByPath(path: string): ModuleDef | undefined {
  return modules.find((m) => m.path === path);
}
