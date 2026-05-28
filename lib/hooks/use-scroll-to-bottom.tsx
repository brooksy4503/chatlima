import { useEffect, useRef, type RefObject } from 'react';

function isExpandCollapseMutation(container: HTMLElement, mutations: MutationRecord[]) {
  return mutations.some((mutation) => {
    let target = mutation.target as HTMLElement;
    while (target && target !== container) {
      if (target.classList?.contains('motion-div')) {
        return true;
      }
      target = target.parentElement as HTMLElement;
    }
    return false;
  });
}

export function useScrollToBottom(scrollTrigger?: unknown): [
  RefObject<HTMLDivElement>,
  RefObject<HTMLDivElement>,
] {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = containerRef.current;
    if (!container || isUserScrollingRef.current) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (!container || !end) return;

    // Initial scroll to bottom
    const initialScrollTimeout = window.setTimeout(() => {
      scrollToBottom('instant');
    }, 100);

    // Track if user has manually scrolled up
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isUserScrollingRef.current = distanceFromBottom > 100;
    };

    // New messages and structural DOM changes
    const mutationObserver = new MutationObserver((mutations) => {
      if (isExpandCollapseMutation(container, mutations)) return;
      scrollToBottom('smooth');
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.clearTimeout(initialScrollTimeout);
      mutationObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (scrollTrigger === undefined) return;
    scrollToBottom('auto');
  }, [scrollTrigger]);

  return [containerRef, endRef] as [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];
}