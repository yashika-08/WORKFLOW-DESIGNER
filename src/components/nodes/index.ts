import { BaseNode } from './BaseNode';
import type { NodeTypes } from '@xyflow/react';

// Cast needed because BaseNode uses a plain props interface instead of the
// React Flow generic NodeProps<T> to avoid the Record<string,unknown> constraint.
export const nodeTypes: NodeTypes = {
  start:     BaseNode as NodeTypes[string],
  task:      BaseNode as NodeTypes[string],
  approval:  BaseNode as NodeTypes[string],
  automated: BaseNode as NodeTypes[string],
  end:       BaseNode as NodeTypes[string],
};
