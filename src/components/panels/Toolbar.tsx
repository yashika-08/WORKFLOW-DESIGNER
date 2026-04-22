import { useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { TestPanel } from '../panels/TestPanel';
import { validateWorkflow } from '../../api/mockApi';

export function Toolbar() {
  const { nodes, edges } = useWorkflowStore();
  const [showTest, setShowTest] = useState(false);

  const handleExport = () => {
    const graph = {
      nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
    };
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const graph = JSON.parse(reader.result as string);
          alert('Import parsed successfully. In a real app, this would load into the canvas.');
          console.log('Imported workflow:', graph);
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const validationErrors = validateWorkflow({
    nodes: nodes.map(n => ({ id: n.id, type: n.type as any, data: n.data, position: n.position })),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
  });
  const hasErrors = validationErrors.some(e => e.severity === 'error');

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="toolbar-brand">HR Workflow Designer</div>
          <div className="toolbar-stats">
            <span>{nodes.length} nodes</span>
            <span className="stat-divider">·</span>
            <span>{edges.length} edges</span>
            {hasErrors && (
              <>
                <span className="stat-divider">·</span>
                <span style={{ color: '#ef4444' }}>⚠ {validationErrors.filter(e => e.severity === 'error').length} error(s)</span>
              </>
            )}
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-toolbar" onClick={handleImport} title="Import workflow JSON">
            ↑ Import
          </button>
          <button className="btn-toolbar" onClick={handleExport} title="Export workflow JSON">
            ↓ Export
          </button>
          <button className="btn-primary toolbar-test" onClick={() => setShowTest(true)}>
            ▶ Test Workflow
          </button>
        </div>
      </div>

      {showTest && <TestPanel onClose={() => setShowTest(false)} />}
    </>
  );
}
