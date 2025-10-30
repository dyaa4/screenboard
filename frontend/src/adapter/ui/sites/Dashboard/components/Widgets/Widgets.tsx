import { useGetWidgetList } from '@hooks/crud/widgets/useGetWidgetList';
import DateTimeWidget from '../DateTimeWidget/DateTimeWidget';
import Calendar from '../Calendar/Calendar';
import NewsWidget from '../NewsWidget/News';
import RemarkWidgets from '../RemarksWidget/RemarksWidget';
import WeatherWidget from '../WeatherWidget/WeatherWidget';
import { UserStatusButton } from '../UserStatusButton/UserStatusButton';
import { UserStatus } from '../helper';
import QRCodeWidget from '../QRCodesWidget/QRCodeWidget';
import { isHtmlDirectionRTL } from '@adapter/ui/helpers/generalHelper';
import MusicWidget from '../MusicWidget/MusicWidget';
import { Layout } from '@domain/entities/Layout';
import { WidgetTypeEnum } from '@domain/types';
import NotesWidget from '../NotesWidget/NotesWidget';
import { Dashboard } from '@domain/entities/Dashboard';
import IoTWidget from '../IoTWidget/IotWidget';

export interface WidgetsProps {
  layout: Layout | undefined;
  dashboard: Dashboard | null;
}

export const Widgets = (props: WidgetsProps) => {
  const { layout: layout, dashboard } = props;
  const { widgetList } = useGetWidgetList(dashboard?._id);

  const sortedWidgets = [...widgetList]
    .sort((a, b) => a.position - b.position)
    .filter((widget) => widget.isActive);

  return (
    <div id="app-menu">
      <div id="app-menu-content-wrapper">
        <div id="app-menu-content">
          <div className="relative">
            {layout?.pinProtectionEnabled && (
              <div
                className={`absolute top-0 ${isHtmlDirectionRTL() ? 'left-0' : 'right-0'}`}
              >
                <UserStatusButton
                  icon={`fa-solid ${isHtmlDirectionRTL() && 'rotate-180'} fa-arrow-right-from-bracket`}
                  id="sign-out-button"
                  userStatus={UserStatus.LoggedOut}
                />
              </div>
            )}
            <div>
              {sortedWidgets.map((widget) => {
                switch (widget.type) {
                  case WidgetTypeEnum.DATETIME:
                    return (
                      <DateTimeWidget
                        layout={layout}
                        widget={widget}
                        key={widget.id}
                        {...widget}
                      />
                    );
                  case WidgetTypeEnum.WEATHER:
                    return (
                      <WeatherWidget
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                        dashboardId={dashboard?._id}
                      />
                    );
                  case WidgetTypeEnum.REMARKS:
                    return (
                      <RemarkWidgets
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );
                  case WidgetTypeEnum.EVENTS:
                    return (
                      <Calendar
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );
                  case WidgetTypeEnum.NEWS:
                    return (
                      <NewsWidget
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );
                  case WidgetTypeEnum.QRCODES:
                    return (
                      <QRCodeWidget
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );

                  case WidgetTypeEnum.MUSIC:
                    return (
                      <MusicWidget
                        key={widget.id}
                        dashboard={dashboard}
                        layout={layout}
                      />
                    );
                  case WidgetTypeEnum.NOTES:
                    return (
                      <NotesWidget
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );
                  case WidgetTypeEnum.IOT:
                    return (
                      <IoTWidget
                        key={widget.id}
                        layout={layout}
                        widget={widget}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
