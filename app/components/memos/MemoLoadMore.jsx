'use client';

import Button from '../ui/Button';
import Loading from '../ui/Loading';

export default function MemoLoadMore({ loading, hasMore, onLoadMore, memosCount }) {
  if (!hasMore && memosCount === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        暂无内容
      </div>
    );
  }

  if (!hasMore && memosCount > 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        已经到底啦 (・ω・)ノ
      </div>
    );
  }

  return (
    <div className="flex justify-center my-10">
      {loading ? (
        <Loading variant="circle" size="md" />
      ) : (
        <Button
          onClick={onLoadMore}
          size="lg"
          variant="primary"
          className="rounded-full"
        >
          加载更多内容
        </Button>
      )}
    </div>
  );
} 