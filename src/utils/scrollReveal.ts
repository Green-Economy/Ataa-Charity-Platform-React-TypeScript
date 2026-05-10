export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;

        if (el.dataset.stagger !== undefined) {
          el.querySelectorAll(':scope > *').forEach((child) => {
            child.classList.add('revealed');
          });
        } else {
          el.classList.add('revealed');
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
    observer.observe(el);
  });

  return () => observer.disconnect();
}