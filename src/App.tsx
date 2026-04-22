import { Sidebar } from './components/sidebar/Sidebar';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/panels/Toolbar';
import './styles.css';

export default function App() {
  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        <Sidebar />
        <Canvas />
      </div>
    </div>
  );
}
