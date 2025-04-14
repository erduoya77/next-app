'use client';

import Button from '../ui/Button';

export default function MemoFilter({ currentTag, onClearFilter }) {
  if (!currentTag) return null;
  
  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800 dark:text-blue-600 dark:border dark:border-gray-700 rounded">
      <span className="dark:text-gray-300">当前筛选：#{currentTag}</span>
      <Button
        onClick={onClearFilter}
        variant="secondary"
        size="sm"
      >
        清除筛选
      </Button>
    </div>
  );
} 