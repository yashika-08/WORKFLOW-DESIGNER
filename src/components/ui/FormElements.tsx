import { type ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function Field({ label, children, required }: FieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input(props: InputProps) {
  return <input className="form-input" {...props} />;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function TextArea(props: TextAreaProps) {
  return <textarea className="form-textarea" rows={3} {...props} />;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}
export function Select({ children, ...props }: SelectProps) {
  return (
    <select className="form-select" {...props}>
      {children}
    </select>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="toggle-row">
      <span className="toggle-label">{label}</span>
      <div
        className={`toggle ${checked ? 'toggle-on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <div className="toggle-thumb" />
      </div>
    </label>
  );
}

interface KVEditorProps {
  pairs: Array<{ key: string; value: string }>;
  onChange: (pairs: Array<{ key: string; value: string }>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}
export function KVEditor({ pairs, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }: KVEditorProps) {
  const updatePair = (i: number, field: 'key' | 'value', val: string) => {
    const next = pairs.map((p, j) => (j === i ? { ...p, [field]: val } : p));
    onChange(next);
  };
  const addPair = () => onChange([...pairs, { key: '', value: '' }]);
  const removePair = (i: number) => onChange(pairs.filter((_, j) => j !== i));

  return (
    <div className="kv-editor">
      {pairs.map((pair, i) => (
        <div key={i} className="kv-row">
          <input
            className="form-input kv-input"
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={e => updatePair(i, 'key', e.target.value)}
          />
          <input
            className="form-input kv-input"
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={e => updatePair(i, 'value', e.target.value)}
          />
          <button className="kv-remove" onClick={() => removePair(i)} title="Remove">✕</button>
        </div>
      ))}
      <button className="btn-ghost" onClick={addPair}>+ Add pair</button>
    </div>
  );
}
