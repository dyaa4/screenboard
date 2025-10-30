import classNames from 'classnames';
import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface IScrollableComponentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const ScrollableComponent: React.FC<IScrollableComponentProps> = ({
  children,
  className,
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.dir || document.body.dir;
    setIsRTL(dir === 'rtl');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (ref.current) {
      setIsScrolling(true);
      setStartX(e.pageX - ref.current.offsetLeft);
      setScrollLeft(ref.current.scrollLeft);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsScrolling(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isScrolling || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1; // Scroll-speed
      ref.current.scrollLeft = scrollLeft - walk;
    },
    [isScrolling, startX, scrollLeft],
  );

  return (
    <div
      ref={ref}
      className={classNames('scrollable-component', className, { rtl: isRTL })}
      id={id}
      style={{
        overflowX: 'auto',
        userSelect: 'none',
        cursor: isScrolling ? 'grabbing' : 'grab',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
};

export default ScrollableComponent;
