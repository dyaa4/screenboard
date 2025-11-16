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
  const [isRTL, setIsRTL] = useState(false);

  // Use refs instead of state for smooth, lag-free scrolling
  const scrollStateRef = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const dir = document.documentElement.dir || document.body.dir;
    setIsRTL(dir === 'rtl');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      setIsScrolling(true);
      scrollStateRef.current.startX = e.pageX - ref.current.offsetLeft;
      scrollStateRef.current.scrollLeft = ref.current.scrollLeft;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsScrolling(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrolling || !ref.current) return;

    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - scrollStateRef.current.startX;

    // Direct scroll - no state dependency = smooth!
    ref.current.scrollLeft = scrollStateRef.current.scrollLeft - walk;
  }, [isScrolling]);

  return (
    <div
      ref={ref}
      className={classNames('scrollable-component', className, { rtl: isRTL })}
      id={id}
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        userSelect: 'none',
        cursor: isScrolling ? 'grabbing' : 'grab',
        direction: isRTL ? 'rtl' : 'ltr',
        backgroundColor: 'transparent',
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