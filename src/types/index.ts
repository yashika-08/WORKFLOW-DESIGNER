// ─── Node Types ───────────────────────────────────────────────────────────────

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export type KeyValue = {
  key: string;
  value: string;
};

// React Flow requires node data to be Record<string, unknown> compatible.
// We use a single flat interface with optional fields per type.
export interface WorkflowNodeData extends Record<string, unknown> {
  type: NodeType;
  // start & task & approval & automated
  title?: string;
  // start
  metadata?: KeyValue[];
  // task
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: KeyValue[];
  // approval
  approverRole?: string;
  autoApproveThreshold?: number;
  // automated
  actionId?: string;
  actionParams?: Record<string, string>;
  // end
  endMessage?: string;
  summaryFlag?: boolean;
}

// Typed views for form components
export interface StartNodeData extends WorkflowNodeData {
  type: 'start';
  title: string;
  metadata: KeyValue[];
}

export interface TaskNodeData extends WorkflowNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData extends WorkflowNodeData {
  type: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData extends WorkflowNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends WorkflowNodeData {
  type: 'end';
  endMessage: string;
  summaryFlag: boolean;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  nodeType: NodeType;
  status: 'success' | 'pending' | 'error' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  summary: string;
}

export interface WorkflowGraph {
  nodes: Array<{
    id: string;
    type: NodeType;
    data: WorkflowNodeData;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}
