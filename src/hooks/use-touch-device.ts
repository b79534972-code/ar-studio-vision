import * as React from "react";

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    const detectTouch = () => {
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const touchPoints = navigator.maxTouchPoints > 0;
      const touchEvents = "ontouchstart" in window;
      setIsTouchDevice(coarsePointer || touchPoints || touchEvents);
    };

    detectTouch();

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    mediaQuery.addEventListener("change", detectTouch);
    return () => mediaQuery.removeEventListener("change", detectTouch);
  }, []);

  return isTouchDevice;
}
