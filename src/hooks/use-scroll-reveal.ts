import { useEffect, useRef } from 'react';

/**
 * Adds the `.revealed` class to elements with `.scroll-reveal`
 * when they enter the viewport, triggering CSS animations.
 * Call once in a layout wrapper to observe the whole page.
 */
export function useScrollReveal(rootSelector = 'main') {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    const root = document.querySelector(rootSelector);
    const targets = root
      ? root.querySelectorAll('.scroll-reveal')
      : document.querySelectorAll('.scroll-reveal');

    targets.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  });
}
