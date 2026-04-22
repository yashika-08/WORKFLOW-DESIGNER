import type { NodeType } from '../types';

export const NODE_META: Record<NodeType, { label: string; color: string; accent: string; icon: string; description: string }> = {
  start: {
    label: 'Start',
    color: '#10b981',
    accent: '#d1fae5',
    icon: '▶',
    description: 'Workflow entry point',
  },
  task: {
    label: 'Task',
    color: '#3b82f6',
    accent: '#dbeafe',
    icon: '✓',
    description: 'Human task or action',
  },
  approval: {
    label: 'Approval',
    color: '#f59e0b',
    accent: '#fef3c7',
    icon: '◎',
    description: 'Manager or HR approval',
  },
  automated: {
    label: 'Automated',
    color: '#8b5cf6',
    accent: '#ede9fe',
    icon: '⚡',
    description: 'System-triggered action',
  },
  end: {
    label: 'End',
    color: '#ef4444',
    accent: '#fee2e2',
    icon: '■',
    description: 'Workflow completion',
  },
};

export function clsx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
