import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return isMobile;
};

export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      // Check if device supports touch and doesn't support hover (typical mobile/tablet)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      setIsTouchDevice(hasTouch && !hasHover);
    };

    checkTouchDevice();

    // Listen for media query changes
    const hoverQuery = window.matchMedia('(hover: hover)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');

    const handleChange = () => checkTouchDevice();
    hoverQuery.addEventListener('change', handleChange);
    pointerQuery.addEventListener('change', handleChange);

    return () => {
      hoverQuery.removeEventListener('change', handleChange);
      pointerQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isTouchDevice;
};
