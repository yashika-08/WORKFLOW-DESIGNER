# HR Workflow Manager

A visual, drag-and-drop workflow builder for HR administrators. Built with React, TypeScript, and React Flow — enabling HR teams to design, validate, and simulate multi-step processes like onboarding, offboarding, and leave approvals without writing any code.

---

## Live Demo

> Run locally with `npm install && npm run dev` → opens at `http://localhost:5173`

---

## Features

| Feature | Description |
|---|---|
| **Drag-and-drop canvas** | Powered by React Flow (@xyflow/react v12) |
| **5 node types** | Start, Task, Approval, Automated Action, End |
| **Click-to-edit forms** | Each node has a dedicated config form in the sidebar |
| **Real-time validation** | Detects missing Start/End nodes, disconnected nodes, and cycles |
| **Simulation engine** | Runs a topological sort (Kahn's BFS) and produces a step-by-step execution log |
| **Mock API layer** | Mirrors a real REST API (`getAutomations`, `simulateWorkflow`, `validateWorkflow`) |
| **JSON export / import** | Save and reload workflow graphs |
| **MiniMap + Controls** | Built-in canvas navigation |
| **Keyboard shortcuts** | Delete/Backspace removes selected nodes and edges |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

> Node.js v18+ recommended.

---

## Project Structure

```
hr-workflow-manager/
├── src/
│   ├── api/
│   │   └── mockApi.ts          # Mock REST API: automations, validate, simulate
│   ├── components/
│   │   ├── Canvas.tsx          # React Flow canvas with drag-and-drop handling
│   │   ├── nodes/
│   │   │   ├── BaseNode.tsx    # Single polymorphic node renderer (type → color/icon)
│   │   │   └── index.ts        # nodeTypes map passed to React Flow
│   │   ├── forms/
│   │   │   └── NodeForms.tsx   # Per-type config forms (Start, Task, Approval, etc.)
│   │   ├── panels/
│   │   │   ├── Toolbar.tsx     # Top bar: export, import, validate, test
│   │   │   └── TestPanel.tsx   # Simulate tab + validation tab with error list
│   │   ├── sidebar/
│   │   │   └── Sidebar.tsx     # Node palette (drag source) + selected node form
│   │   └── ui/
│   │       └── FormElements.tsx  # Reusable: Field, Input, TextArea, Select, Toggle, KVEditor
│   ├── hooks/
│   │   └── index.ts            # useAutomations(), useDebounce()
│   ├── store/
│   │   └── workflowStore.ts    # Zustand store: nodes, edges, selection, CRUD
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces and union types
│   ├── utils/
│   │   └── index.ts            # NODE_META config: colors, icons, labels per type
│   ├── App.tsx                 # Root layout (Canvas + Sidebar + Toolbar)
│   ├── main.tsx                # React entry point
│   └── styles.css              # Global styles and React Flow overrides
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .env.example                # Environment variable template (copy to .env.local)
└── .gitignore
```

---

## Architecture Decisions

### State Management — Zustand
Zustand was chosen over Context or Redux for its minimal boilerplate and direct compatibility with React Flow's `applyNodeChanges` / `applyEdgeChanges` helpers. The store is the single source of truth for all nodes, edges, and the selected node ID.

### Single BaseNode Renderer
Rather than five separate node components, one `BaseNode` reads `data.type` to switch its colour, icon, and subtitle. This keeps the `nodeTypes` map thin and makes adding a new node type a one-line change in `NODE_META` (utils).

### Dispatcher Pattern for Forms
`NodeForms.tsx` dispatches to a type-specific form component. Adding a new node type requires changes in only four places: `types/index.ts`, `workflowStore.ts` (default data), `NodeForms.tsx` (new form component), and `utils/index.ts` (NODE_META entry). No other files need to change.

### Mock API Layer
`mockApi.ts` mirrors a real REST API surface:
- `getAutomations()` → simulates `GET /automations`
- `simulateWorkflow(graph)` → simulates `POST /simulate` with a topological execution
- `validateWorkflow(graph)` → synchronous, used for real-time toolbar error indicators

### Graph Validation
- Exactly one Start node required
- At least one End node required
- Disconnected node detection
- Cycle detection via iterative DFS

### Simulation Engine
Topological sort (Kahn's BFS) determines execution order. Each node generates a timestamped log entry. Results display as a visual timeline in the Test Panel.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework, strict mode |
| Vite | Dev server and build tool |
| @xyflow/react v12 | Canvas and graph engine |
| Zustand v5 | State management |
| lucide-react | Icon set |
| clsx | Conditional className utility |

---

## What I'd Add With More Time

- **Undo/Redo** — React Flow has a history hook; would integrate as Zustand middleware
- **Node validation badges** — red/yellow indicator dots directly on misconfigured nodes
- **Auto-layout** — Dagre for automatic top-down arrangement of pasted or imported graphs
- **Backend persistence** — FastAPI + PostgreSQL to save/load named workflow templates
- **Workflow templates** — pre-built graphs for onboarding, offboarding, leave approval
- **Real-time collaboration** — WebSocket cursor presence via SSE
- **Unit tests** — Jest for `mockApi.ts`, `workflowStore.ts`, and form validation logic
- **E2E tests** — Playwright test suite for canvas drag-and-drop interactions

---


