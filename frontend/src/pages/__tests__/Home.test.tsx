import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Home } from '../Home';
import { getHomeService } from '../../features/home/homeService';
import { mockHomeService } from '../../features/home/adapters/mockHomeAdapter';

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname}</div>;
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('Home / Command Center', () => {
  it('defaults to the mock home service (no Core dependency)', () => {
    expect(getHomeService()).toBe(mockHomeService);
    expect(mockHomeService.ready).toBe(true);
  });

  it('renders greeting, presence hero and quick entry', async () => {
    renderHome();
    expect(screen.getByText(/Good (morning|afternoon|evening), Tony/)).toBeInTheDocument();
    expect(screen.getByText('JARVIS')).toBeInTheDocument();
    expect(screen.getByTestId('home-ask-input')).toBeInTheDocument();
  });

  it('renders all primary sections from mock data', async () => {
    renderHome();
    await screen.findByTestId('home-tasks');
    expect(screen.getByTestId('home-schedule')).toBeInTheDocument();
    expect(screen.getByTestId('home-automations')).toBeInTheDocument();
    expect(screen.getByTestId('home-smarthome')).toBeInTheDocument();
    expect(screen.getByTestId('home-system')).toBeInTheDocument();
    expect(screen.getByTestId('activity-timeline')).toBeInTheDocument();
    // a specific mock datum renders
    expect(screen.getByText('Finish the Mark III report')).toBeInTheDocument();
  });

  it('ask bar navigates to /chat', async () => {
    renderHome();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('home-ask-input'), 'hello there');
    await user.click(screen.getByTestId('home-ask-send'));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/chat'));
  });

  it('Tasks widget "All" navigates to /tasks', async () => {
    renderHome();
    const user = userEvent.setup();
    await screen.findByTestId('home-tasks');
    await user.click(screen.getByTestId('widget-go-tasks'));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/tasks'));
  });
});

describe('mock home adapter', () => {
  it('returns a complete snapshot shape', async () => {
    const snap = await mockHomeService.getSnapshot();
    expect(snap.tasks.length).toBeGreaterThan(0);
    expect(snap.events.length).toBeGreaterThan(0);
    expect(snap.automations.length).toBeGreaterThan(0);
    expect(snap.devices.length).toBeGreaterThan(0);
    expect(snap.activity.length).toBeGreaterThan(0);
    expect(snap.system).toHaveProperty('cpu');
  });
});
