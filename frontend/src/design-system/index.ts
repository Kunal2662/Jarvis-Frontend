// JARVIS Design System — public API barrel

// Foundations
export * from './lib/cn';
export * from './lib/uiState';
export * from './foundations/motion';

// Theme engine
export * from './theme/ThemeProvider';

// Hooks
export * from './hooks/useMediaQuery';
export * from './hooks/useReducedMotion';
export * from './hooks/useHotkey';
export * from './hooks/useAsync';

// Primitives
export * from './primitives/Glass/Glass';
export * from './primitives/Button/Button';
export * from './primitives/Button/IconButton';
export * from './primitives/Button/SplitButton';
export * from './primitives/Input/Input';
export * from './primitives/Input/TextArea';
export * from './primitives/Select/Select';
export * from './primitives/Combobox/Combobox';
export * from './primitives/Selection/Checkbox';
export * from './primitives/Selection/Radio';
export * from './primitives/Selection/Switch';
export * from './primitives/Badge/Badge';
export * from './primitives/Spinner/Spinner';
export * from './primitives/Skeleton/Skeleton';
export * from './primitives/Progress/Progress';
export * from './primitives/Divider/Divider';
export * from './primitives/Kbd/Kbd';
export * from './primitives/Avatar/Avatar';
export * from './primitives/Label/Label';
export * from './primitives/Tooltip/Tooltip';
export * from './primitives/Popover/Popover';
export * from './primitives/Dropdown/Dropdown';
export * from './primitives/Modal/Modal';
export * from './primitives/Drawer/Drawer';

// Composites
export * from './composites/Card/Card';
export * from './composites/Card/StatCard';
export * from './composites/EmptyState/EmptyState';
export * from './composites/StateView/StateView';
export * from './composites/Widget/Widget';
export * from './composites/FormField/FormField';
export * from './composites/Tabs/Tabs';
export * from './composites/Breadcrumb/Breadcrumb';
export * from './composites/Pagination/Pagination';
export * from './composites/Toast/Toast';

// Data
export * from './data/Table/Table';
export * from './data/DataGrid/DataGrid';
export * from './data/List/List';
export * from './data/TreeView/TreeView';

// Patterns (window shell)
export * from './patterns/Sidebar/Sidebar';
export * from './patterns/TopBar/TopBar';
export * from './patterns/TopNav/TopNav';
export * from './patterns/StatusBar/StatusBar';
export * from './patterns/CommandPalette/CommandPalette';
export * from './patterns/SearchOverlay/SearchOverlay';
export * from './patterns/NotificationCenter/NotificationCenter';
export * from './patterns/WorkspaceContainer/WorkspaceContainer';
export * from './patterns/ModulePage/ModulePage';
export * from './patterns/Dock/Dock';
export * from './patterns/QuickSettings/QuickSettings';
export * from './patterns/WindowFrame/WindowFrame';
export * from './patterns/VoiceOrb/VoiceOrb';

// Layouts
export * from './layouts/AppShell/AppShell';
