import { Skeleton } from '@heroui/react';

function WidgetListSkeletons({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return <></>;
  }
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="rounded-lg">
        <div className="h-20 rounded-lg bg-secondary"></div>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-20 rounded-lg bg-secondary"></div>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-20 rounded-lg bg-secondary"></div>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-20 rounded-lg bg-secondary"></div>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-20 rounded-lg bg-secondary"></div>
      </Skeleton>
    </div>
  );
}

export default WidgetListSkeletons;
