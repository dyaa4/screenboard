import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Button, Accordion, AccordionItem, Tooltip } from '@heroui/react';
import { useEffect, useState } from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaGripVertical,
  FaCloud,
  FaCalendarAlt,
  FaClock,
  FaMusic,
  FaNewspaper,
  FaQrcode,
  FaCommentAlt,
  FaStickyNote,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Widget } from '@domain/entities/Widget';
import { isHtmlDirectionRTL } from '@adapter/ui/helpers/generalHelper';
import {
  DateTimeWidgetSettings,
  EventWidgetSettings,
  IoTWidgetSettings,
  NewsWidgetSettings,
  QRCodeWidgetSettings,
  RemarkWidgetSettings,
  WeatherWidgetSettings,
  WidgetTypeEnum,
} from '@domain/types';
import DateTimeEdit from '../DateTimeEdit/DateTimeEdit';
import EventsEdit from '../EventsEdit/EventsEdit';
import MusicEdit from '../MusicEdit/MusicEdit';
import NewsEdit from '../NewsEdit/NewsEdit';
import QRcodesEdit from '../QRcodesEdit/QRcodesEdit';
import RemarksEdit from '../RemarksEdit/RemarksEdit';
import WeatherEdit from '../WeatherEdit/WeatherEdit';
import NotesEdit from '../NotesEdit/NotesEdit';
import { NoteWidgetSettings } from '@domain/types/widget/NoteWidgetSettings';
import IoTEdit from '../IoTEdit/IoTEdit';

interface WidgetProps {
  widget: Widget;
  updateWidget?: (props: IPatchableProps) => Promise<void>;
  dragHandleListeners?: any;
  isDragging?: boolean;
}

interface SubComponentProps {
  settings: any;
  onSettingsChange: (settings: any, valid: boolean) => void;
  onHideSaveButton: (hide: boolean) => void;
}

function WidgetItem({
  widget: initialWidget,
  updateWidget,
  dragHandleListeners,
  isDragging,
}: WidgetProps) {
  const { t } = useTranslation();
  const [widget, setWidget] = useState<Widget>(initialWidget);
  const [patchableProps, setPatchableProps] = useState<IPatchableProps>({});
  const [isValid, setIsValid] = useState<boolean>(true);
  const [hideSaveButton, setHideSaveButton] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState({
    toggleActive: false,
    save: false,
  });
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [lastSelectedKeys, setLastSelectedKeys] = useState<Set<string>>(
    new Set([]),
  );

  useEffect(() => {
    if (isDragging) {
      setLastSelectedKeys(selectedKeys);
      setSelectedKeys(new Set([]));
    } else {
      setSelectedKeys(lastSelectedKeys);
    }
  }, [isDragging]);

  const getWidgetIcon = () => {
    const iconClass = 'text-xl';
    switch (widget.type) {
      case WidgetTypeEnum.WEATHER:
        return <FaCloud className={`${iconClass} text-primary`} />;
      case WidgetTypeEnum.EVENTS:
        return <FaCalendarAlt className={`${iconClass} text-warning`} />;
      case WidgetTypeEnum.DATETIME:
        return <FaClock className={`${iconClass} text-success`} />;
      case WidgetTypeEnum.MUSIC:
        return <FaMusic className={`${iconClass} text-danger`} />;
      case WidgetTypeEnum.NEWS:
        return <FaNewspaper className={`${iconClass} text-secondary`} />;
      case WidgetTypeEnum.QRCODES:
        return <FaQrcode className={`${iconClass} text-primary`} />;
      case WidgetTypeEnum.REMARKS:
        return <FaCommentAlt className={`${iconClass} text-warning`} />;
      case WidgetTypeEnum.NOTES:
        return <FaStickyNote className={`${iconClass} text-success`} />;
      case WidgetTypeEnum.IOT:
        return <FaCloud className={`${iconClass} text-success`} />;
      default:
        return null;
    }
  };

  const enhancedDragHandleListeners = {
    ...dragHandleListeners,
    onDragStart: (e: any) => {
      setLastSelectedKeys(selectedKeys);
      setSelectedKeys(new Set([]));
      dragHandleListeners?.onDragStart?.(e);
    },
  };

  async function handleToggleActive() {
    try {
      setLoadingStates((prev) => ({ ...prev, toggleActive: true }));
      const updatedIsActive = !widget.isActive;
      if (updateWidget) await updateWidget({ isActive: updatedIsActive });

      setWidget((prevWidget) => ({
        ...prevWidget,
        isActive: updatedIsActive,
        getSettingsSchema: prevWidget.getSettingsSchema,
        validateSettings: prevWidget.validateSettings,
        getDefaultSettings: prevWidget.getDefaultSettings,
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, toggleActive: false }));
    }
  }

  const handleSettingsChange = (settings: any, valid: boolean) => {
    setPatchableProps({ settings });
    setIsValid(valid);
  };

  const handleHideSaveButton = (hide: boolean) => {
    setHideSaveButton(hide);
  };

  const handleSave = async () => {
    if (isValid && updateWidget) {
      try {
        setLoadingStates((prev) => ({ ...prev, save: true }));
        await updateWidget(patchableProps);
        setWidget((prevWidget) => ({
          ...prevWidget,
          ...patchableProps,
          getSettingsSchema: prevWidget.getSettingsSchema,
          validateSettings: prevWidget.validateSettings,
          getDefaultSettings: prevWidget.getDefaultSettings,
        }));
      } finally {
        setSelectedKeys(new Set([]));
        setLoadingStates((prev) => ({ ...prev, save: false }));
      }
    }
  };

  const renderWidgetEdit = () => {
    const commonProps: SubComponentProps = {
      onSettingsChange: handleSettingsChange,
      onHideSaveButton: handleHideSaveButton,
      settings: undefined,
    };

    switch (widget.type) {
      case WidgetTypeEnum.WEATHER:
        return (
          <WeatherEdit
            {...commonProps}
            settings={widget.settings as WeatherWidgetSettings}
          />
        );
      case WidgetTypeEnum.REMARKS:
        return (
          <RemarksEdit
            {...commonProps}
            settings={widget.settings as RemarkWidgetSettings}
          />
        );
      case WidgetTypeEnum.EVENTS:
        return (
          <EventsEdit
            {...commonProps}
            widget={widget}
            settings={widget.settings as EventWidgetSettings}
          />
        );
      case WidgetTypeEnum.QRCODES:
        return (
          <QRcodesEdit
            {...commonProps}
            settings={widget.settings as QRCodeWidgetSettings}
          />
        );
      case WidgetTypeEnum.NEWS:
        return (
          <NewsEdit
            {...commonProps}
            settings={widget.settings as NewsWidgetSettings}
          />
        );
      case WidgetTypeEnum.MUSIC:
        return (
          <MusicEdit
            dashboardId={widget.dashboardId}
            onHideSaveButton={handleHideSaveButton}
          />
        );
      case WidgetTypeEnum.DATETIME:
        return (
          <DateTimeEdit
            {...commonProps}
            settings={widget.settings as DateTimeWidgetSettings}
          />
        );
      case WidgetTypeEnum.NOTES:
        return (
          <NotesEdit
            {...commonProps}
            settings={widget.settings as NoteWidgetSettings}
          />
        );
      case WidgetTypeEnum.IOT:
        return (
          <IoTEdit
            {...commonProps}
            widget={widget}
            settings={widget.settings as IoTWidgetSettings}
          />
        );
      default:
        return <div>Unknown Widget Type</div>;
    }
  };

  const itemClasses = {
    base: 'py-0 w-full',
    title: 'font-normal text-medium',
    trigger: 'px-2 py-0 rounded-lg h-14 flex items-center',
    indicator: 'text-medium',
    content: 'text-small px-2',
  };

  const isRTL = isHtmlDirectionRTL();

  return (
    <div className="group relative">
      <div
        className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-4 pt-1 px-2 cursor-grab active:cursor-grabbing touch-none`}
        {...enhancedDragHandleListeners}
      >
        <FaGripVertical className="text-default-500 text-l" />
      </div>

      <Accordion
        showDivider={false}
        itemClasses={itemClasses}
        variant="splitted"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          const newKeys = keys as Set<string>;
          setSelectedKeys(newKeys);
          setLastSelectedKeys(newKeys);
        }}
      >
        <AccordionItem
          key={widget.id}
          aria-label={t(widget.title)}
          startContent={
            <div className={isRTL ? 'pr-6' : 'pl-6'}>{getWidgetIcon()}</div>
          }
          title={
            <div className="flex items-center justify-between w-full">
              <span className="text-medium text-default-600">
                {t(widget.title)}
              </span>
              <div
                className={`flex items-center gap-2 ${isRTL ? 'pl-2' : 'pr-2'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip
                  showArrow
                  content={
                    widget.isActive
                      ? t('actions.deactive')
                      : t('actions.active')
                  }
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loadingStates.toggleActive) {
                        handleToggleActive();
                      }
                    }}
                    className={`inline-flex items-center justify-center min-w-8 h-8 rounded-full transition-colors ${
                      loadingStates.toggleActive
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-default-100 active:bg-default-200'
                    }`}
                    role="button"
                    tabIndex={loadingStates.toggleActive ? -1 : 0}
                    aria-disabled={loadingStates.toggleActive}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !loadingStates.toggleActive) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleActive();
                      }
                    }}
                  >
                    {loadingStates.toggleActive ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : widget.isActive ? (
                      <FaEye className="text-primary" />
                    ) : (
                      <FaEyeSlash className="text-default-400" />
                    )}
                  </div>
                </Tooltip>
              </div>
            </div>
          }
        >
          <div className="py-2">
            {renderWidgetEdit()}
            <div className="flex justify-end gap-2 mt-4">
              {!hideSaveButton && (
                <Button
                  color="primary"
                  onPress={handleSave}
                  isDisabled={!isValid}
                  isLoading={loadingStates.save}
                >
                  {t('actions.save')}
                </Button>
              )}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default WidgetItem;
