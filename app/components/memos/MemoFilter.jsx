'use client';

import Button from '../ui/Button';

export default function MemoFilter({ currentTag, onClearFilter }) {
  if (!currentTag) return null;
  
  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-700 rounded">
      <span className="text-gray-700 font-medium dark:text-gray-200">当前筛选：<span className="text-blue-600 dark:text-blue-400">#{currentTag}</span></span>
      <Button
        onClick={onClearFilter}
        variant="secondary"
        size="sm"
        className="ml-2 font-medium"
      >
        清除筛选
      </Button>
    </div>
  );
} 