'use client';

import HiddenPlaceholder from '@/components/HiddenPlaceholder';
import { useVisibility } from '@/lib/useVisibility';

export default function VisibilityGate({ visibilityKey, title, children }) {
  const { visibility, ready } = useVisibility();
  if (ready && !visibility[visibilityKey]) {
    return <HiddenPlaceholder title={title} />;
  }
  return children;
}
