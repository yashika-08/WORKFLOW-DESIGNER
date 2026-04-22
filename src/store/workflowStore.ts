import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeChange,
} from '@xyflow/react';
import type { WorkflowNodeData, NodeType } from '../types';

type WFNode = Node<WorkflowNodeData>;

interface WorkflowStore {
  nodes: WFNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
}

const defaultData: Record<NodeType, WorkflowNodeData> = {
  start: { type: 'start', title: 'Start', metadata: [] },
  task: { type: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approval: { type: 'approval', title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 },
  automated: { type: 'automated', title: 'Automated Step', actionId: '', actionParams: {} },
  end: { type: 'end', endMessage: 'Workflow Complete', summaryFlag: false },
};

let nodeCounter = 1;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 300, y: 80 },
      data: { type: 'start', title: 'Onboarding Start', metadata: [{ key: 'department', value: 'Engineering' }] },
    },
  ],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes as Node[]) as WFNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
        get().edges
      ),
    });
  },

  addNode: (type, position) => {
    const id = `${type}-${++nodeCounter}`;
    const newNode: WFNode = {
      id,
      type,
      position,
      data: { ...defaultData[type] },
    };
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },
}));
