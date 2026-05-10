import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reset فوري بدون animation
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.filter = 'blur(4px)';

    void el.offsetHeight; // force reflow

    // شغّل الـ animation
    el.style.transition = [
      'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
      'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
      'filter 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
    ].join(', ');

    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.filter = 'blur(0px)';

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(4px)', willChange: 'opacity, transform, filter' }}>
      {children}
    </div>
  );
}