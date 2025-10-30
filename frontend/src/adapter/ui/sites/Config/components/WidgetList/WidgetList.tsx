import ErrorState from '@components/ErrorState/ErrorState';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { useGetWidgetList } from '@hooks/crud/widgets/useGetWidgetList';
import { useUpdateWidget } from '@hooks/crud/widgets/useUpdateWidget';
import { JSX, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SortableItem from './SortableItem';
import WidgetItem from './WidgetItem';
import WidgetListSkeletons from './WidgetListSkeletons';
import { Widget } from '@domain/entities/Widget';

export interface WidgetListProps {
  dashboardId: string | undefined;
}

function WidgetList({ dashboardId }: WidgetListProps): JSX.Element {
  const { t } = useTranslation();
  const { widgetList, setWidgetList, isLoading, error } =
    useGetWidgetList(dashboardId);
  const { updateWidget } = useUpdateWidget(dashboardId);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const { active } = event;
    const widget = widgetList.find((w) => w.id === active.id);
    setDraggedWidget(widget!);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, over } = event;

      if (active.id !== over?.id) {
        setWidgetList((widgets) => {
          const oldIndex = widgets.findIndex(
            (widget) => widget.id === active.id,
          );
          const newIndex = widgets.findIndex(
            (widget) => widget.id === over?.id,
          );

          const newWidgets = arrayMove(widgets, oldIndex, newIndex);
          const movedWidget = newWidgets[newIndex];
          updateWidget(movedWidget, { position: newIndex });

          return newWidgets;
        });
      }
      setDraggedWidget(null);
    },
    [updateWidget],
  );

  return (
    <div>
      {error && !isLoading && (
        <ErrorState
          title={t('sites.config.components.widgetList.errorLoading')}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={widgetList.map((w) => w.id!)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {widgetList.map((widget) => (
              <SortableItem key={widget.id} id={widget.id!}>
                <WidgetItem
                  widget={widget}
                  updateWidget={(props: IPatchableProps) =>
                    updateWidget(widget, props)
                  }
                  isDragging={isDragging}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
        {isDragging && draggedWidget && (
          <DragOverlay>
            <WidgetItem widget={draggedWidget} isDragging={isDragging} />
          </DragOverlay>
        )}
      </DndContext>

      <WidgetListSkeletons isLoading={isLoading} />
    </div>
  );
}

export default WidgetList;
