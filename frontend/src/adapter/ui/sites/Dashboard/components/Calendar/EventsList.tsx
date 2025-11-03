import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Layout } from '../../../../../../domain/entities/Layout';
import { SimpleEventDto } from '../../../../../../domain/dtos/SimpleEventDto';
import { useTheme } from 'next-themes';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import moment from 'moment';
import { JSX } from 'react';
import { FaCalendar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface EventsListProps {
    events: SimpleEventDto[];
    layout: Layout | undefined;
    currentLang: string;
}

/**
 * EventsList - UI Presentation Component
 * Displays a list of events with proper styling and layout
 * Part of the Adapter Layer (UI presentation)
 */
export const EventsList = ({
    events,
    layout,
    currentLang,
}: EventsListProps): JSX.Element => {
    const { theme } = useTheme();

    const formatEventDate = (event: SimpleEventDto): string => {
        const dateStr = event.start.dateTime || event.start.date;
        if (!dateStr) return 'No date';

        return moment(dateStr).locale('de').format('DD.MM.YYYY');
    };

    const formatEventTime = (event: SimpleEventDto): string | null => {
        const dateStr = event.start.dateTime;
        if (!dateStr) return null; // All-day event

        return moment(dateStr).locale('de').format('HH:mm');
    };

    const getEventColorClass = (index: number): string => {
        const colors = [
            'bg-blue-100/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            'bg-purple-100/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
            'bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
            'bg-orange-100/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            'bg-cyan-100/50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
        ];
        return colors[index % colors.length];
    };

    if (events.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-default-500">
                <p className="text-center">
                    {currentLang === 'de'
                        ? 'Keine zukünftigen Ereignisse vorhanden'
                        : 'No upcoming events'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {events.map((event, index) => (
                <Card
                    key={event.id}
                    className={`${getEventColorClass(index)} border shadow-md hover:shadow-lg transition-shadow`}
                    style={getCustomColorCssClass(layout, theme)}
                >
                    <CardHeader className="flex flex-col items-start px-4 py-3">
                        <div className="flex items-start justify-between w-full gap-2">
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-default-900 dark:text-default-100 line-clamp-2">
                                    {event.summary}
                                </h3>
                                {event.location && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-default-600">
                                        <FaMapMarkerAlt className="w-3 h-3" />
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-default-700 dark:text-default-400 whitespace-nowrap">
                                <FaCalendar className="w-3 h-3" />
                                {formatEventDate(event)}
                            </div>
                        </div>
                    </CardHeader>

                    {(event.description || formatEventTime(event)) && (
                        <>
                            <Divider className="my-0" />
                            <CardBody className="px-4 py-2 space-y-1">
                                {formatEventTime(event) && (
                                    <div className="flex items-center gap-2 text-xs text-default-600 dark:text-default-400">
                                        <FaClock className="w-3 h-3" />
                                        <span>{formatEventTime(event)}</span>
                                    </div>
                                )}
                                {event.description && (
                                    <p className="text-xs text-default-600 dark:text-default-400 line-clamp-2">
                                        {event.description}
                                    </p>
                                )}
                                {event.creator && (
                                    <p className="text-xs text-default-500 dark:text-default-500">
                                        {currentLang === 'de' ? 'Von: ' : 'By: '}
                                        {event.creator.displayName || event.creator.email}
                                    </p>
                                )}
                            </CardBody>
                        </>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default EventsList;
