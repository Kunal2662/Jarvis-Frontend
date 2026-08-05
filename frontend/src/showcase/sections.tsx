import { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  Cpu,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  Inbox,
  Plus,
  Save,
  Trash2,
  User,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Combobox,
  DataGrid,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  FormField,
  IconButton,
  Input,
  Kbd,
  Label,
  List,
  ListRow,
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Pagination,
  Password,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  SkeletonText,
  SplitButton,
  StatCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TreeView,
  useToast,
  VoiceOrb,
  WindowFrame,
  type Column,
  type VoiceState,
} from '../design-system';

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 text-content">{title}</h2>
        {subtitle && <p className="text-body-sm text-content-secondary">{subtitle}</p>}
      </div>
      <div className="rounded-xl border border-line-subtle bg-surface-base p-6">{children}</div>
    </section>
  );
}

export function ButtonsSection() {
  return (
    <Section title="Buttons" subtitle="Primary actions, icon buttons, and split buttons.">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" data-testid="btn-primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger" leftIcon={<Trash2 className="size-4" />}>Delete</Button>
          <Button variant="ai" leftIcon={<Bot className="size-4" />}>Ask Jarvis</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <IconButton label="Add" variant="soft"><Plus /></IconButton>
          <IconButton label="Add" variant="solid"><Plus /></IconButton>
          <IconButton label="Add"><Plus /></IconButton>
          <SplitButton
            leftIcon={<Save className="size-4" />}
            menu={
              <>
                <DropdownMenuItem>Save as draft</DropdownMenuItem>
                <DropdownMenuItem>Save and close</DropdownMenuItem>
              </>
            }
          >
            Save
          </SplitButton>
        </div>
      </div>
    </Section>
  );
}

export function InputsSection() {
  const [search, setSearch] = useState('');
  const [combo, setCombo] = useState('gpt');
  return (
    <Section title="Inputs & Forms" subtitle="Text, password, search, select, combobox and validation.">
      <div className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Full name" required>
          {(p) => <Input placeholder="Tony Stark" {...p} />}
        </FormField>
        <FormField label="Password" description="At least 8 characters.">
          {(p) => <Password placeholder="••••••••" {...p} />}
        </FormField>
        <FormField label="Email" error="Enter a valid email address.">
          {(p) => <Input defaultValue="not-an-email" {...p} />}
        </FormField>
        <FormField label="Search">
          {() => <Search value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Filter…" />}
        </FormField>
        <FormField label="Model">
          {() => (
            <Select defaultValue="sonnet">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sonnet">Claude Sonnet</SelectItem>
                <SelectItem value="gpt">GPT-5.4</SelectItem>
                <SelectItem value="gemini">Gemini 3 Pro</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField label="Provider (combobox)">
          {() => (
            <Combobox
              value={combo}
              onChange={setCombo}
              options={[
                { value: 'gpt', label: 'OpenAI', icon: <Cpu className="size-4" /> },
                { value: 'anthropic', label: 'Anthropic', icon: <Bot className="size-4" /> },
                { value: 'google', label: 'Google', icon: <Hash className="size-4" /> },
              ]}
            />
          )}
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Notes">
            {(p) => <TextArea placeholder="Add a note for Jarvis…" {...p} />}
          </FormField>
        </div>
      </div>
    </Section>
  );
}

export function SelectionSection() {
  const [checked, setChecked] = useState(true);
  const [sw, setSw] = useState(true);
  return (
    <Section title="Selection Controls" subtitle="Checkbox, radio, and switch.">
      <div className="flex flex-wrap items-start gap-10">
        <label className="flex items-center gap-2.5 text-body-sm text-content">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} data-testid="checkbox-demo" />
          Enable memory
        </label>
        <label className="flex items-center gap-2.5 text-body-sm text-content">
          <Checkbox checked="indeterminate" /> Partial
        </label>
        <RadioGroup defaultValue="a" className="gap-2">
          <label className="flex items-center gap-2.5 text-body-sm text-content"><RadioGroupItem value="a" /> Automatic</label>
          <label className="flex items-center gap-2.5 text-body-sm text-content"><RadioGroupItem value="b" /> Manual</label>
        </RadioGroup>
        <div className="flex items-center gap-2.5">
          <Switch checked={sw} onCheckedChange={setSw} id="sw" data-testid="switch-demo" />
          <Label htmlFor="sw">Voice wake word</Label>
        </div>
      </div>
    </Section>
  );
}

export function FeedbackSection() {
  const { toast } = useToast();
  return (
    <Section title="Feedback" subtitle="Badges, toasts, progress, spinners and skeletons.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="accent" dot>Active</Badge>
          <Badge variant="success" dot>Online</Badge>
          <Badge variant="warning">Degraded</Badge>
          <Badge variant="danger">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" data-testid="toast-info" onClick={() => toast({ title: 'Synced', description: 'Workspace is up to date.', variant: 'success' })}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast({ title: 'Heads up', description: 'Memory nearly full.', variant: 'warning' })}>Warning toast</Button>
          <Button variant="secondary" onClick={() => toast({ title: 'Jarvis', description: 'I drafted a summary for you.', variant: 'ai', action: { label: 'View', onClick: () => {} } })}>AI toast</Button>
        </div>
        <div className="grid max-w-md gap-3">
          <Progress value={72} />
          <Progress value={40} tone="success" />
          <Progress value={90} tone="warning" />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonText lines={3} className="max-w-sm" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </Section>
  );
}

export function DisplaySection() {
  return (
    <Section title="Display" subtitle="Cards, stat cards, avatars and empty states.">
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active agents" value={12} icon={<Bot />} delta={{ value: '+3', direction: 'up' }} hint="vs last week" />
          <StatCard label="Tasks due" value={7} icon={<Check />} delta={{ value: '-2', direction: 'down' }} />
          <StatCard label="Memory items" value="1.2k" icon={<Inbox />} />
          <StatCard label="System health" value="99.9%" icon={<Cpu />} delta={{ value: '+0.1', direction: 'up' }} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card interactive>
            <CardHeader>
              <CardTitle>Knowledge Graph</CardTitle>
              <CardDescription>Explore relationships across your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar size="sm" fallback="TS" status="online" />
                <Avatar size="sm" fallback="JV" />
                <span className="text-body-sm text-content-secondary">+8 collaborators</span>
              </div>
            </CardContent>
          </Card>
          <Card variant="ghost" className="border border-dashed border-line">
            <EmptyState
              icon={<FolderOpen />}
              title="No projects yet"
              description="Ask Jarvis to draft your first project, or create one manually."
              action={<Button size="sm" leftIcon={<Plus className="size-4" />}>New project</Button>}
              secondaryAction={<Button size="sm" variant="ghost">Import</Button>}
            />
          </Card>
        </div>
      </div>
    </Section>
  );
}

interface Agent extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  runs: number;
  latency: number;
}

const agents: Agent[] = [
  { id: '1', name: 'Research Agent', status: 'active', runs: 1284, latency: 240 },
  { id: '2', name: 'Summarizer', status: 'idle', runs: 842, latency: 180 },
  { id: '3', name: 'Scheduler', status: 'active', runs: 3120, latency: 96 },
  { id: '4', name: 'File Indexer', status: 'error', runs: 44, latency: 512 },
];

export function DataSection() {
  const [selected, setSelected] = useState<string>();
  const [page, setPage] = useState(3);
  const columns: Column<Agent>[] = [
    { key: 'name', header: 'Agent', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'active' ? 'success' : r.status === 'error' ? 'danger' : 'neutral'} dot>
          {r.status}
        </Badge>
      ),
    },
    { key: 'runs', header: 'Runs', align: 'right', sortable: true },
    { key: 'latency', header: 'Latency (ms)', align: 'right', sortable: true },
  ];
  const tree = [
    {
      id: 'ws',
      label: 'Workspace',
      icon: <Folder />,
      children: [
        { id: 'notes', label: 'Notes', icon: <FileText /> },
        { id: 'projects', label: 'Projects', icon: <Folder />, children: [{ id: 'p1', label: 'Mark III', icon: <FileText /> }] },
      ],
    },
  ];
  return (
    <Section title="Data" subtitle="Readability-first tables, data grid, lists and tree view (no glass).">
      <div className="flex flex-col gap-6">
        <DataGrid columns={columns} data={agents} getRowId={(r) => r.id} selectedId={selected} onRowClick={(r) => setSelected(r.id)} />
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line-subtle bg-surface-base p-2">
            <List>
              <ListRow leading={<Bot />} title="Research Agent" subtitle="Ran 2 minutes ago" trailing={<Badge variant="success" size="sm">active</Badge>} active />
              <ListRow leading={<FileText />} title="Weekly summary" subtitle="Generated by Jarvis" />
              <ListRow leading={<User />} title="Tony Stark" subtitle="Owner" />
            </List>
          </div>
          <div className="rounded-lg border border-line-subtle bg-surface-base p-2">
            <TreeView nodes={tree} defaultExpanded={['ws']} selectedId="notes" />
          </div>
        </div>
      </div>
    </Section>
  );
}

export function NavigationSection() {
  return (
    <Section title="Navigation" subtitle="Tabs, dropdown, popover and tooltip.">
      <div className="flex flex-col gap-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><p className="text-body-sm text-content-secondary">Line tabs use a bottom accent indicator.</p></TabsContent>
          <TabsContent value="board"><p className="text-body-sm text-content-secondary">Board view.</p></TabsContent>
          <TabsContent value="files"><p className="text-body-sm text-content-secondary">Files view.</p></TabsContent>
        </Tabs>
        <Tabs defaultValue="d" >
          <TabsList variant="segmented">
            <TabsTrigger variant="segmented" value="d">Comfortable</TabsTrigger>
            <TabsTrigger variant="segmented" value="c">Compact</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="secondary">Open menu</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem><Save />Save<Kbd className="ml-auto">⌘S</Kbd></DropdownMenuItem>
              <DropdownMenuItem><User />Assign</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Popover</Button></PopoverTrigger>
            <PopoverContent>
              <p className="text-body-sm text-content">Glass popover with crystal-clear content above the blur substrate.</p>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost">Hover me</Button></TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Section>
  );
}

export function OverlaySection() {
  return (
    <Section title="Overlays" subtitle="Modal dialog and floating window.">
      <div className="flex flex-wrap items-start gap-6">
        <Modal>
          <ModalTrigger asChild><Button data-testid="open-modal">Open modal</Button></ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete workspace?</ModalTitle>
              <ModalDescription>This permanently removes all projects, notes, and files. This action cannot be undone.</ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
              <Button variant="danger" leftIcon={<Trash2 className="size-4" />}>Delete</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <WindowFrame title="diagnostics.log" icon={<AlertTriangle />} className="h-56 w-96">
          <pre className="p-4 font-mono text-caption text-content-secondary">
{`[08:42:01] boot: JARVIS core online
[08:42:01] theme: dark / comfortable
[08:42:02] glass: adaptive → enabled
[08:42:02] agents: 12 active
[08:42:03] status: all systems nominal`}
          </pre>
        </WindowFrame>
      </div>
    </Section>
  );
}

export function VoiceSection() {
  const [state, setState] = useState<VoiceState>('idle');
  const states: VoiceState[] = ['idle', 'listening', 'thinking', 'speaking'];
  return (
    <Section title="Voice Orb & AI Presence" subtitle="The sole home of the cyan aura. Ambient motion respects reduced-motion.">
      <div className="flex flex-col items-center gap-6">
        <VoiceOrb state={state} size={140} />
        <div className="flex flex-wrap justify-center gap-2">
          {states.map((s) => (
            <Button key={s} size="sm" variant={state === s ? 'primary' : 'secondary'} onClick={() => setState(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>
      </div>
    </Section>
  );
}
