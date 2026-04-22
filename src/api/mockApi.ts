import type { AutomationAction, SimulationResult, WorkflowGraph, ValidationError } from '../types';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'priority'] },
  { id: 'notify_slack', label: 'Send Slack Notification', params: ['channel', 'message'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'date', 'duration'] },
  { id: 'generate_badge', label: 'Generate Access Badge', params: ['employeeId', 'accessLevel'] },
  { id: 'provision_account', label: 'Provision IT Account', params: ['email', 'role', 'department'] },
];

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return [...MOCK_AUTOMATIONS];
}

export function validateWorkflow(graph: WorkflowGraph): ValidationError[] {
  const errors: ValidationError[] = [];

  const startNodes = graph.nodes.filter(n => n.type === 'start');
  const endNodes = graph.nodes.filter(n => n.type === 'end');

  if (startNodes.length === 0)
    errors.push({ message: 'Workflow must have at least one Start node', severity: 'error' });
  if (startNodes.length > 1)
    errors.push({ message: 'Workflow can only have one Start node', severity: 'error' });
  if (endNodes.length === 0)
    errors.push({ message: 'Workflow must have at least one End node', severity: 'error' });

  const connectedNodeIds = new Set<string>();
  graph.edges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  if (graph.nodes.length > 1) {
    graph.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        const title = (node.data.title as string) || (node.data.endMessage as string) || 'End';
        errors.push({
          nodeId: node.id,
          message: `Node "${title}" is disconnected`,
          severity: 'warning',
        });
      }
    });
  }

  // Cycle detection via DFS
  const adjList: Record<string, string[]> = {};
  graph.nodes.forEach(n => { adjList[n.id] = []; });
  graph.edges.forEach(e => { if (adjList[e.source]) adjList[e.source].push(e.target); });

  const visited = new Set<string>();
  const inStack = new Set<string>();
  let hasCycle = false;

  const dfs = (nodeId: string) => {
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const neighbor of (adjList[nodeId] || [])) {
      if (!visited.has(neighbor)) dfs(neighbor);
      else if (inStack.has(neighbor)) { hasCycle = true; return; }
    }
    inStack.delete(nodeId);
  };

  graph.nodes.forEach(n => { if (!visited.has(n.id)) dfs(n.id); });
  if (hasCycle)
    errors.push({ message: 'Workflow contains a cycle — this may cause infinite loops', severity: 'error' });

  return errors;
}

export async function simulateWorkflow(graph: WorkflowGraph): Promise<SimulationResult> {
  await delay(800);

  const validationErrors = validateWorkflow(graph);
  const hardErrors = validationErrors.filter(e => e.severity === 'error');

  if (hardErrors.length > 0) {
    return {
      success: false,
      steps: [],
      errors: hardErrors.map(e => e.message),
      summary: 'Simulation aborted due to validation errors.',
    };
  }

  // Topological sort (Kahn's algorithm)
  const adjList: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  graph.nodes.forEach(n => { adjList[n.id] = []; inDegree[n.id] = 0; });
  graph.edges.forEach(e => {
    adjList[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue: string[] = graph.nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const order: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    for (const neighbor of adjList[nodeId]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  const nodeMap = Object.fromEntries(graph.nodes.map(n => [n.id, n]));
  const now = Date.now();

  const steps = order.map((nodeId, i) => {
    const node = nodeMap[nodeId];
    const data = node.data;
    const title = (data.title as string) || (data.endMessage as string) || 'End';

    const messages: Record<string, string> = {
      start: `Workflow initiated: "${title}"`,
      task: `Task assigned to ${(data.assignee as string) || 'Unassigned'}: "${title}"`,
      approval: `Awaiting approval from ${(data.approverRole as string) || 'Manager'} for "${title}"`,
      automated: `Executing automation: "${title}" (action: ${(data.actionId as string) || '—'})`,
      end: `Workflow completed. ${data.summaryFlag ? 'Summary report generated.' : ''}`,
    };

    return {
      nodeId,
      nodeTitle: title,
      nodeType: node.type,
      status: 'success' as const,
      message: messages[node.type] || `Processed node: "${title}"`,
      timestamp: new Date(now + i * 1500).toISOString(),
    };
  });

  return {
    success: true,
    steps,
    errors: validationErrors.filter(e => e.severity === 'warning').map(e => e.message),
    summary: `Successfully simulated ${steps.length} step(s) across the workflow.`,
  };
}
