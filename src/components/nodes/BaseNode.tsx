import { Handle, Position } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { NODE_META } from '../../utils';
import type { NodeType } from '../../types';

// Use a plain props interface to avoid React Flow generic constraints
interface BaseNodeProps {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selected: boolean;
}

export function BaseNode({ id, data, selected }: BaseNodeProps) {
  const { setSelectedNode } = useWorkflowStore();
  const nodeType = (data?.type ?? 'task') as NodeType;
  const meta = NODE_META[nodeType];

  const title = nodeType === 'end'
    ? (data?.endMessage as string) || 'End'
    : (data?.title as string) || meta.label;

  const subtitleMap: Record<NodeType, string> = {
    start: 'Entry Point',
    task: `Assignee: ${(data?.assignee as string) || '—'}`,
    approval: `Role: ${(data?.approverRole as string) || '—'}`,
    automated: `Action: ${(data?.actionId as string) || '—'}`,
    end: 'Completion',
  };

  return (
    <div
      onClick={() => setSelectedNode(id)}
      style={{
        border: `2px solid ${selected ? meta.color : 'rgba(255,255,255,0.15)'}`,
        boxShadow: selected
          ? `0 0 0 3px ${meta.color}33, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        background: selected
          ? `linear-gradient(135deg, #1a1a2e 0%, ${meta.color}22 100%)`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        transition: 'all 0.2s ease',
      }}
      className="node-card"
    >
      {nodeType !== 'start' && (
        <Handle type="target" position={Position.Top} style={{ background: meta.color, border: '2px solid #0f0f23' }} />
      )}

      <div className="node-header" style={{ borderBottom: `1px solid ${meta.color}33` }}>
        <span className="node-icon" style={{ color: meta.color, background: `${meta.color}22` }}>
          {meta.icon}
        </span>
        <span className="node-type-label" style={{ color: meta.color }}>{meta.label}</span>
      </div>

      <div className="node-body">
        <div className="node-title">{title}</div>
        <div className="node-subtitle">{subtitleMap[nodeType]}</div>
      </div>

      {nodeType !== 'end' && (
        <Handle type="source" position={Position.Bottom} style={{ background: meta.color, border: '2px solid #0f0f23' }} />
      )}
    </div>
  );
}
