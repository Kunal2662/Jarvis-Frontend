import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Task, TasksService } from '../tasksService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors AutomationsPageStates.test.tsx.
let fakeService: TasksService;

vi.mock('../tasksService', () => ({
  getTasksService: () => fakeService,
}));

import { TasksPage } from '../TasksPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/tasks']}>
          <TasksPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<TasksService>): TasksService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    setStatus: vi.fn(),
    toggleComplete: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TasksPage async states', () => {
  it('shows a loading state while tasks are being fetched', () => {
    fakeService = baseService({ getTasks: vi.fn(() => new Promise<Task[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state with a create action when there are no tasks', async () => {
    fakeService = baseService({ getTasks: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No tasks yet');
    expect(screen.getByTestId('task-create-empty')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const getTasks = vi.fn().mockRejectedValueOnce(new Error('tasks store unreachable'));
    fakeService = baseService({ getTasks });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/tasks store unreachable/)).toBeInTheDocument();

    getTasks.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getTasks: vi.fn().mockRejectedValue(new Error('Core tasks contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
