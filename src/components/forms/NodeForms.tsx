import { useWorkflowStore } from '../../store/workflowStore';
import { useAutomations } from '../../hooks';
import { Field, Input, TextArea, Select, Toggle, KVEditor } from '../ui/FormElements';
import { NODE_META } from '../../utils';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  WorkflowNodeData,
  NodeType,
} from '../../types';

// ─── Start Node Form ──────────────────────────────────────────────────────────
export function StartForm({ nodeId, data }: { nodeId: string; data: StartNodeData }) {
  const { updateNodeData } = useWorkflowStore();
  const u = (patch: Partial<StartNodeData>) => updateNodeData(nodeId, patch);
  return (
    <div className="node-form">
      <Field label="Start Title" required>
        <Input value={data.title || ''} onChange={e => u({ title: e.target.value })} placeholder="e.g. Employee Onboarding" />
      </Field>
      <Field label="Metadata (Key-Value Pairs)">
        <KVEditor pairs={data.metadata || []} onChange={metadata => u({ metadata })} keyPlaceholder="e.g. department" valuePlaceholder="e.g. Engineering" />
      </Field>
    </div>
  );
}

// ─── Task Node Form ───────────────────────────────────────────────────────────
export function TaskForm({ nodeId, data }: { nodeId: string; data: TaskNodeData }) {
  const { updateNodeData } = useWorkflowStore();
  const u = (patch: Partial<TaskNodeData>) => updateNodeData(nodeId, patch);
  return (
    <div className="node-form">
      <Field label="Task Title" required>
        <Input value={data.title || ''} onChange={e => u({ title: e.target.value })} placeholder="e.g. Collect Employee Documents" />
      </Field>
      <Field label="Description">
        <TextArea value={data.description || ''} onChange={e => u({ description: e.target.value })} placeholder="Describe what needs to be done..." />
      </Field>
      <Field label="Assignee">
        <Input value={data.assignee || ''} onChange={e => u({ assignee: e.target.value })} placeholder="e.g. hr-team@company.com" />
      </Field>
      <Field label="Due Date">
        <Input type="date" value={data.dueDate || ''} onChange={e => u({ dueDate: e.target.value })} />
      </Field>
      <Field label="Custom Fields">
        <KVEditor pairs={data.customFields || []} onChange={customFields => u({ customFields })} keyPlaceholder="Field name" valuePlaceholder="Field value" />
      </Field>
    </div>
  );
}

// ─── Approval Node Form ───────────────────────────────────────────────────────
const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite', 'Legal'];

export function ApprovalForm({ nodeId, data }: { nodeId: string; data: ApprovalNodeData }) {
  const { updateNodeData } = useWorkflowStore();
  const u = (patch: Partial<ApprovalNodeData>) => updateNodeData(nodeId, patch);
  return (
    <div className="node-form">
      <Field label="Approval Title" required>
        <Input value={data.title || ''} onChange={e => u({ title: e.target.value })} placeholder="e.g. Manager Approval" />
      </Field>
      <Field label="Approver Role">
        <Select value={data.approverRole || 'Manager'} onChange={e => u({ approverRole: e.target.value })}>
          {APPROVER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Field>
      <Field label="Auto-Approve Threshold (days)">
        <Input type="number" min={0} value={data.autoApproveThreshold ?? 0} onChange={e => u({ autoApproveThreshold: parseInt(e.target.value) || 0 })} placeholder="0 = no auto-approve" />
        <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Automatically approve if no response within this many days (0 = disabled)</p>
      </Field>
    </div>
  );
}

// ─── Automated Step Form ──────────────────────────────────────────────────────
export function AutomatedForm({ nodeId, data }: { nodeId: string; data: AutomatedNodeData }) {
  const { updateNodeData } = useWorkflowStore();
  const { automations, loading } = useAutomations();
  const u = (patch: Partial<AutomatedNodeData>) => updateNodeData(nodeId, patch);

  const selectedAction = automations.find(a => a.id === data.actionId);

  return (
    <div className="node-form">
      <Field label="Step Title" required>
        <Input value={data.title || ''} onChange={e => u({ title: e.target.value })} placeholder="e.g. Send Welcome Email" />
      </Field>
      <Field label="Action">
        <Select value={data.actionId || ''} onChange={e => u({ actionId: e.target.value, actionParams: {} })} disabled={loading}>
          <option value="">{loading ? 'Loading actions…' : '— Select an action —'}</option>
          {automations.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </Select>
      </Field>
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="action-params">
          <div className="form-label" style={{ marginBottom: 8 }}>Action Parameters</div>
          {selectedAction.params.map(param => (
            <Field key={param} label={param.charAt(0).toUpperCase() + param.slice(1)}>
              <Input
                value={(data.actionParams || {})[param] || ''}
                onChange={e => u({ actionParams: { ...(data.actionParams || {}), [param]: e.target.value } })}
                placeholder={`Enter ${param}…`}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── End Node Form ────────────────────────────────────────────────────────────
export function EndForm({ nodeId, data }: { nodeId: string; data: EndNodeData }) {
  const { updateNodeData } = useWorkflowStore();
  const u = (patch: Partial<EndNodeData>) => updateNodeData(nodeId, patch);
  return (
    <div className="node-form">
      <Field label="End Message">
        <Input value={data.endMessage || ''} onChange={e => u({ endMessage: e.target.value })} placeholder="e.g. Onboarding Complete!" />
      </Field>
      <Field label="Generate Summary">
        <Toggle label="Generate completion summary report" checked={!!data.summaryFlag} onChange={v => u({ summaryFlag: v })} />
      </Field>
    </div>
  );
}

// ─── Form Dispatcher ──────────────────────────────────────────────────────────
interface NodeFormPanelProps {
  nodeId: string;
  data: WorkflowNodeData;
}

export function NodeFormPanel({ nodeId, data }: NodeFormPanelProps) {
  const { deleteNode } = useWorkflowStore();
  const meta = NODE_META[data.type as NodeType];

  return (
    <div className="form-panel">
      <div className="form-panel-header" style={{ borderBottom: `2px solid ${meta.color}` }}>
        <div className="form-panel-title">
          <span style={{ color: meta.color, fontSize: 18 }}>{meta.icon}</span>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>{meta.label} Node</div>
            <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{nodeId}</div>
          </div>
        </div>
        <button className="btn-danger-ghost" onClick={() => deleteNode(nodeId)} title="Delete node">🗑</button>
      </div>
      <div className="form-panel-body">
        {data.type === 'start'     && <StartForm     nodeId={nodeId} data={data as StartNodeData}     />}
        {data.type === 'task'      && <TaskForm      nodeId={nodeId} data={data as TaskNodeData}      />}
        {data.type === 'approval'  && <ApprovalForm  nodeId={nodeId} data={data as ApprovalNodeData}  />}
        {data.type === 'automated' && <AutomatedForm nodeId={nodeId} data={data as AutomatedNodeData} />}
        {data.type === 'end'       && <EndForm       nodeId={nodeId} data={data as EndNodeData}       />}
      </div>
    </div>
  );
}
