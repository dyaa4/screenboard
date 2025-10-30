import { Card, Skeleton } from '@heroui/react';

const DashboardListSkeletons = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
      {[...Array(8)].map((_, index) => (
        <Card key={index} className="w-full space-y-5 p-4" radius="lg">
          <Skeleton className="rounded-lg">
            <div className="h-24 rounded-lg bg-default-300" />
          </Skeleton>
          <div className="space-y-3">
            <Skeleton className="w-full rounded-lg">
              <div className="h-3 w-3/5 rounded-lg bg-default-200" />
            </Skeleton>

            <Skeleton className="w-2/12 h-8 rounded-lg float-right">
              <div className="h-3 w-1/5 rounded-lg bg-default-300" />
            </Skeleton>

            <Skeleton className="w-2/12 h-8 rounded-lg float-right mr-2">
              <div className="h-3 w-1/5 rounded-lg bg-default-300" />
            </Skeleton>
          </div>
        </Card>
      ))}
    </div>
  );
};
export default DashboardListSkeletons;
