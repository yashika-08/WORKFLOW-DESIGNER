import { useWorkflowStore } from '../../store/workflowStore';
import { NODE_META } from '../../utils';
import type { NodeType } from '../../types';

const NODE_ORDER: NodeType[] = ['start', 'task', 'approval', 'automated', 'end'];

export function Sidebar() {
  const { addNode } = useWorkflowStore();

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (type: NodeType) => {
    addNode(type, { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-mark">T</span>
          <div>
            <div className="logo-title">Tredence</div>
            <div className="logo-sub">Workflow Designer</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Node Library</div>
        <p className="sidebar-hint">Drag onto canvas or click to add</p>
        <div className="node-palette">
          {NODE_ORDER.map(type => {
            const meta = NODE_META[type];
            return (
              <div
                key={type}
                className="palette-item"
                draggable
                onDragStart={e => handleDragStart(e, type)}
                onClick={() => handleQuickAdd(type)}
                style={{ borderColor: `${meta.color}44` }}
              >
                <span className="palette-icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                  {meta.icon}
                </span>
                <div className="palette-info">
                  <div className="palette-name" style={{ color: meta.color }}>
                    {meta.label}
                  </div>
                  <div className="palette-desc">{meta.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Instructions</div>
        <ul className="sidebar-tips">
          <li>Drag nodes from the library onto the canvas</li>
          <li>Click a node to edit its properties</li>
          <li>Connect nodes by dragging from handle to handle</li>
          <li>Press Delete or Backspace to remove selected items</li>
          <li>Use the Test panel to simulate the workflow</li>
        </ul>
      </div>
    </aside>
  );
}
