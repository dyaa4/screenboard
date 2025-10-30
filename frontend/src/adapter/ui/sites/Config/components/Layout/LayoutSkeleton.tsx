import React from 'react';
import { Card, CardBody, CardHeader, Skeleton } from '@heroui/react';

const LayoutSkeleton: React.FC = () => {
  return (
    <div>
      <Skeleton className="w-1/3 h-8 mb-4" /> {/* Title skeleton */}
      <div className="flex flex-col gap-4">
        {/* Sicherheit Card */}
        <Card fullWidth>
          <CardHeader>
            <Skeleton className="w-1/4 h-6" /> {/* Card title skeleton */}
          </CardHeader>
          <CardBody>
            <div className="flex flex-row items-center gap-4">
              <Skeleton className="w-1/3 h-4" /> {/* Text skeleton */}
              <Skeleton className="w-12 h-6 rounded-full" />{' '}
              {/* Switch skeleton */}
            </div>
            <div className="mt-2">
              <Skeleton className="w-full h-10" /> {/* Input skeleton */}
            </div>
          </CardBody>
        </Card>

        {/* Anzeige Card */}
        <Card fullWidth>
          <CardHeader>
            <Skeleton className="w-1/4 h-6" /> {/* Card title skeleton */}
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Skeleton className="w-full h-10" /> {/* Slider skeleton */}
              <div>
                <Skeleton className="w-1/4 h-4 mb-2" />{' '}
                {/* Radio group label skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-6" />{' '}
                  {/* Radio button skeleton */}
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-20 h-6" />
                </div>
              </div>
              <div>
                <Skeleton className="w-1/4 h-4 mb-2" />{' '}
                {/* Radio group label skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-6" />{' '}
                  {/* Radio button skeleton */}
                  <Skeleton className="w-20 h-6" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Hintergrund Card */}
        <Card>
          <CardHeader>
            <Skeleton className="w-1/4 h-6" /> {/* Card title skeleton */}
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div className="flex flex-col items-center gap-2" key={index}>
                  <Skeleton className="w-24 h-24" /> {/* Image skeleton */}
                  <Skeleton className="w-6 h-6 rounded" />{' '}
                  {/* Checkbox skeleton */}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LayoutSkeleton;
