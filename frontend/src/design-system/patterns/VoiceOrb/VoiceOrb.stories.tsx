import type { Meta, StoryObj } from '@storybook/react';
import { VoiceOrb } from './VoiceOrb';

const meta: Meta<typeof VoiceOrb> = {
  title: 'Patterns/VoiceOrb',
  component: VoiceOrb,
  parameters: { layout: 'centered' },
  args: { size: 160, premium: true },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'thinking', 'speaking', 'processing', 'offline'],
    },
    size: { control: { type: 'range', min: 48, max: 240, step: 8 } },
  },
};
export default meta;

type Story = StoryObj<typeof VoiceOrb>;

export const Idle: Story = { args: { state: 'idle' } };
export const Listening: Story = { args: { state: 'listening' } };
export const Thinking: Story = { args: { state: 'thinking' } };
export const Speaking: Story = { args: { state: 'speaking' } };
export const Processing: Story = { args: { state: 'processing' } };
export const Offline: Story = { args: { state: 'offline' } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {(['idle', 'listening', 'thinking', 'speaking', 'processing', 'offline'] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-3">
          <VoiceOrb state={s} size={110} premium />
          <span className="text-caption capitalize text-content-tertiary">{s}</span>
        </div>
      ))}
    </div>
  ),
};
