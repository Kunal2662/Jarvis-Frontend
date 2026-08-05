import type { Meta, StoryObj } from '@storybook/react';
import { Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { StatCard } from './StatCard';

const meta: Meta<typeof Card> = {
  title: 'Composites/Card',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Knowledge Graph</CardTitle>
        <CardDescription>Explore relationships across your workspace.</CardDescription>
      </CardHeader>
      <CardContent>Content goes here.</CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive className="w-80 p-5">
      Hover me — I lift.
    </Card>
  ),
};

export const Stats: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Active agents" value={12} icon={<Bot />} delta={{ value: '+3', direction: 'up' }} />
      <StatCard label="Tasks due" value={7} delta={{ value: '-2', direction: 'down' }} hint="today" />
    </div>
  ),
};
