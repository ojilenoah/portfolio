import { useState, useCallback } from 'react';

type CopyFn = (text: string) => void;

export function useCopyToClipboard(): [CopyFn, boolean] {
  const [isCopied, setIsCopied] = useState(false);

  const copy: CopyFn = useCallback((text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return;
    }

    // Try to save to clipboard, then save it in state
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((error) => {
        console.warn('Copy failed', error);
        setIsCopied(false);
      });
  }, []);

  return [copy, isCopied];
}
