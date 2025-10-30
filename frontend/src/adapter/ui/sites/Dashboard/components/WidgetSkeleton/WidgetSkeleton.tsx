import { Card, CardBody, CardHeader, Skeleton } from '@heroui/react';
import { Layout } from '../../../../../../domain/entities/Layout';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { useTheme } from 'next-themes';

interface WidgetSkeletonProps {
  layout: Layout | undefined;
  variant?: 'calendar' | 'news' | 'weather' | 'music' | 'iot' | 'qrcode' | 'default';
}

export const WidgetSkeleton = ({ layout, variant = 'default' }: WidgetSkeletonProps) => {
  const { theme } = useTheme();

  const renderCalendarSkeleton = () => (
    <div className="flex gap-4">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="shrink-0 w-[250px] min-h-[180px] max-h-[350px] shadow-lg"
          style={getCustomColorCssClass(layout, theme)}
        >
          <CardHeader className="flex-col items-start pb-2">
            <Skeleton className="h-5 w-32 rounded-lg mb-2" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </CardHeader>
          <CardBody className="pt-2">
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderNewsSkeleton = () => (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="w-80 shrink-0 shadow-lg"
          style={getCustomColorCssClass(layout, theme)}
        >
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-xl" />
          </CardHeader>
          <CardBody className="py-3 px-4 gap-2">
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-5/6 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-lg mt-2" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
            <Skeleton className="h-3 w-3/4 rounded-lg" />
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderWeatherSkeleton = () => (
    <div className="flex gap-4 w-full">
      {[...Array(7)].map((_, i) => (
        <Card
          key={i}
          className="flex-1 min-w-[180px] h-[8vw] max-h-[160px] min-h-[140px] shadow-lg"
          style={getCustomColorCssClass(layout, theme)}
        >
          <CardBody className="flex flex-row justify-between p-5">
            <div className="flex flex-col justify-between w-full">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderMusicSkeleton = () => (
    <Card
      className="shadow-lg"
      style={getCustomColorCssClass(layout, theme)}
    >
      <CardBody className="p-6 space-y-4">
        <Skeleton className="w-full h-40 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
        <div className="flex gap-2 justify-center">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </CardBody>
    </Card>
  );

  const renderIoTSkeleton = () => (
    <div className="flex gap-3 overflow-auto min-w-max">
      {[...Array(4)].map((_, i) => (
        <Card
          key={i}
          className="shadow-lg"
          style={{
            width: '160px',
            height: '120px',
            ...getCustomColorCssClass(layout, theme),
          }}
        >
          <CardBody className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderQRCodeSkeleton = () => (
    <Card
      className="shadow-lg"
      style={getCustomColorCssClass(layout, theme)}
    >
      <CardHeader className="pb-0 pt-6 px-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
      </CardHeader>
      <CardBody className="flex items-center justify-center py-8">
        <Skeleton className="w-48 h-48 rounded-lg" />
      </CardBody>
    </Card>
  );

  const renderDefaultSkeleton = () => (
    <Card
      className="shadow-lg"
      style={getCustomColorCssClass(layout, theme)}
    >
      <CardBody className="p-6 space-y-4">
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
      </CardBody>
    </Card>
  );

  const skeletonVariants = {
    calendar: renderCalendarSkeleton,
    news: renderNewsSkeleton,
    weather: renderWeatherSkeleton,
    music: renderMusicSkeleton,
    iot: renderIoTSkeleton,
    qrcode: renderQRCodeSkeleton,
    default: renderDefaultSkeleton,
  };

  return (
    <div className="animate-pulse">
      {skeletonVariants[variant]()}
    </div>
  );
};

export default WidgetSkeleton;
