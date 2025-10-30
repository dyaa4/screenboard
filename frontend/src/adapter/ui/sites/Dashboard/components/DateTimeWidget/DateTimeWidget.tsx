import { Widget } from '@domain/entities/Widget';
import DateInfo from '../DateInfo/DateInfo';
import Time from '../Time/Time';
import { Layout } from '@domain/entities/Layout';

export interface IInfoProps {
  id?: string;
  widget: Widget;
  layout: Layout | undefined;
}

const DateTimeWidget: React.FC<IInfoProps> = (props) => {
  const { id, widget, layout } = props;
  return (
    <>
      <div id={id} className="info my-4">
        <Time widget={widget} layout={layout} />
        <DateInfo widget={widget} layout={layout} />
      </div>
    </>
  );
};
export default DateTimeWidget;
