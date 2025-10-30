import { getFontSizeClass } from '@sites/Dashboard/helper';
import ScrollableComponent from '../ScrollableComponent/ScrollableComponent';
import { Layout } from '@domain/entities/Layout';

export interface IMenuSectionProps {
  children: any;
  layout?: Layout;
  icon: string;
  scrollable?: boolean;
  title: string;
}

const MenuSection: React.FC<IMenuSectionProps> = (props: IMenuSectionProps) => {
  const getContent = (): JSX.Element => {
    if (props.scrollable) {
      return (
        <ScrollableComponent className="flex flex-row gap-4">
          {props.children}
        </ScrollableComponent>
      );
    }

    return <div className="flex flex-row gap-4 ">{props.children}</div>;
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="items-center flex gap-2">
        <i className={props.icon + ' text-white'} />
        <span
          className={`${getFontSizeClass(props?.layout?.fontSize)} text-white`}
        >
          {props.title}
        </span>
      </div>
      {getContent()}
    </div>
  );
};

export default MenuSection;
