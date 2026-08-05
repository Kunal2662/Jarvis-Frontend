import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Save } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Ask Jarvis' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'outline', 'danger', 'ai'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const AI: Story = { args: { variant: 'ai', leftIcon: <Plus className="size-4" /> } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };
export const Loading: Story = { args: { loading: true, children: 'Saving' } };
export const WithIcon: Story = { args: { leftIcon: <Save className="size-4" />, children: 'Save' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ai">AI</Button>
    </div>
  ),
};
