import { useEffect } from 'react';

export function useUnsavedChangesGuard(isDirty) {
  useEffect(() => {
    const handler = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
