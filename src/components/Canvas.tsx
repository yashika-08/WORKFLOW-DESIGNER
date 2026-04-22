import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { nodeTypes } from './nodes';
import { NodeFormPanel } from './forms/NodeForms';
import { NODE_META } from '../utils';
import type { NodeType, WorkflowNodeData } from '../types';

export function Canvas() {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useWorkflowStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeId) as Node<WorkflowNodeData> | undefined;

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('nodeType') as NodeType;
      if (!type) return;

      const rfEl = (e.target as HTMLElement).closest('.react-flow');
      if (!rfEl) return;
      const bounds = rfEl.getBoundingClientRect();

      const vpEl = rfEl.querySelector('.react-flow__viewport') as HTMLElement;
      const style = window.getComputedStyle(vpEl);
      const matrix = new DOMMatrix(style.transform);

      const x = (e.clientX - bounds.left - matrix.e) / matrix.a;
      const y = (e.clientY - bounds.top - matrix.f) / matrix.d;

      addNode(type, { x, y });
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNode(node.id),
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  return (
    <div className="canvas-area">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        deleteKeyCode={['Delete', 'Backspace']}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#f59e0b', strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e293b" />
        <Controls
          style={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
        />
        <MiniMap
          style={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)' }}
          nodeColor={node => NODE_META[(node.type as NodeType) || 'task']?.color || '#64748b'}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

      {selectedNode && <NodeFormPanel nodeId={selectedNode.id} data={selectedNode.data} />}
    </div>
  );
}
