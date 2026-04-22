import { useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { simulateWorkflow, validateWorkflow } from '../../api/mockApi';
import { NODE_META } from '../../utils';
import type { SimulationResult, WorkflowGraph } from '../../types';

interface TestPanelProps {
  onClose: () => void;
}

export function TestPanel({ onClose }: TestPanelProps) {
  const { nodes, edges } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'validate' | 'simulate'>('simulate');

  const buildGraph = (): WorkflowGraph => ({
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type as any,
      data: n.data,
      position: n.position,
    })),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
  });

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const graph = buildGraph();
      const res = await simulateWorkflow(graph);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = () => {
    const graph = buildGraph();
    const errors = validateWorkflow(graph);
    setResult({
      success: errors.filter(e => e.severity === 'error').length === 0,
      steps: [],
      errors: errors.filter(e => e.severity === 'error').map(e => e.message),
      summary:
        errors.length === 0
          ? '✓ Workflow structure is valid. No issues found.'
          : `Found ${errors.length} issue(s) in the workflow.`,
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="test-panel-overlay">
      <div className="test-panel">
        <div className="test-panel-header">
          <div>
            <h2 className="test-panel-title">Workflow Sandbox</h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
              {nodes.length} nodes · {edges.length} connections
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="test-tabs">
          <button
            className={`test-tab ${activeTab === 'simulate' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulate')}
          >
            ▶ Simulate
          </button>
          <button
            className={`test-tab ${activeTab === 'validate' ? 'active' : ''}`}
            onClick={() => setActiveTab('validate')}
          >
            ◎ Validate
          </button>
        </div>

        <div className="test-panel-body">
          {activeTab === 'simulate' && (
            <>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                Run a dry simulation of your workflow to see how each node would execute in sequence.
              </p>
              <button className="btn-primary" onClick={handleSimulate} disabled={loading}>
                {loading ? (
                  <span className="loading-dots">Simulating<span>.</span><span>.</span><span>.</span></span>
                ) : (
                  '▶ Run Simulation'
                )}
              </button>
            </>
          )}

          {activeTab === 'validate' && (
            <>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                Check your workflow for structural issues like missing start/end nodes, disconnected
                nodes, or cycles.
              </p>
              <button className="btn-secondary" onClick={handleValidate}>
                ◎ Validate Structure
              </button>
            </>
          )}

          {result && (
            <div className="simulation-result">
              <div
                className={`result-banner ${result.success ? 'success' : 'error'}`}
              >
                {result.success ? '✓' : '✗'} {result.summary}
              </div>

              {result.errors.length > 0 && (
                <div className="result-errors">
                  <div className="result-section-label">Issues</div>
                  {result.errors.map((err, i) => (
                    <div key={i} className="error-item">⚠ {err}</div>
                  ))}
                </div>
              )}

              {result.steps.length > 0 && (
                <div className="result-steps">
                  <div className="result-section-label">Execution Log</div>
                  {result.steps.map((step, i) => {
                    const meta = NODE_META[step.nodeType];
                    return (
                      <div key={i} className="step-item" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="step-line">
                          <div className="step-icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                            {meta.icon}
                          </div>
                          {i < result.steps.length - 1 && (
                            <div className="step-connector" style={{ background: `${meta.color}44` }} />
                          )}
                        </div>
                        <div className="step-content">
                          <div className="step-header">
                            <span className="step-title">{step.nodeTitle}</span>
                            <span className="step-time">{formatTime(step.timestamp)}</span>
                          </div>
                          <div className="step-message">{step.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="result-json">
                <div className="result-section-label">Workflow JSON</div>
                <pre className="json-preview">
                  {JSON.stringify(buildGraph(), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
