'use client';

import { useState } from 'react';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function CodeCopyButton({ code, blockId }) {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <button
      onClick={handleCopyClick}
      className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
      title={copied ? '已复制' : '复制代码'}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="w-5 h-5" />
      ) : (
        <ClipboardIcon className="w-5 h-5" />
      )}
    </button>
  );
} 