import { useEffect } from 'react';

/**
 * Handles global keyboard shortcuts
 * @param {Object} shortcuts Map of shortcut combinations to callback functions
 */
export function useKeyboardShortcut(shortcuts = {}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Enter -> Generate
      if (isCmdOrCtrl && e.key === 'Enter') {
        if (shortcuts.onGenerate) {
          e.preventDefault();
          shortcuts.onGenerate();
        }
      }

      // Cmd/Ctrl + K -> Focus Search/Input
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        if (shortcuts.onFocusInput) {
          e.preventDefault();
          shortcuts.onFocusInput();
        }
      }

      // Escape -> Clear / Close Modal
      if (e.key === 'Escape') {
        if (shortcuts.onEscape) {
          shortcuts.onEscape();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
