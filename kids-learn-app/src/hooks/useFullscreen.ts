"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const checkFullscreen = useCallback(() => {
    if (typeof document === "undefined") return false;
    return !!(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element })
        .webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element })
        .mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element })
        .msFullscreenElement
    );
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;

    const docEl = document.documentElement;

    try {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (
        (docEl as unknown as { webkitRequestFullscreen?: () => Promise<void> })
          .webkitRequestFullscreen
      ) {
        await (
          docEl as unknown as { webkitRequestFullscreen: () => Promise<void> }
        ).webkitRequestFullscreen();
      } else if (
        (docEl as unknown as { mozRequestFullScreen?: () => Promise<void> })
          .mozRequestFullScreen
      ) {
        await (
          docEl as unknown as { mozRequestFullScreen: () => Promise<void> }
        ).mozRequestFullScreen();
      } else if (
        (docEl as unknown as { msRequestFullscreen?: () => Promise<void> })
          .msRequestFullscreen
      ) {
        await (
          docEl as unknown as { msRequestFullscreen: () => Promise<void> }
        ).msRequestFullscreen();
      } else {
        setIsSupported(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (
        (document as unknown as { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen
      ) {
        await (
          document as unknown as { webkitExitFullscreen: () => Promise<void> }
        ).webkitExitFullscreen();
      } else if (
        (document as unknown as { mozCancelFullScreen?: () => Promise<void> })
          .mozCancelFullScreen
      ) {
        await (
          document as unknown as { mozCancelFullScreen: () => Promise<void> }
        ).mozCancelFullScreen();
      } else if (
        (document as unknown as { msExitFullscreen?: () => Promise<void> })
          .msExitFullscreen
      ) {
        await (
          document as unknown as { msExitFullscreen: () => Promise<void> }
        ).msExitFullscreen();
      }
    } catch (err) {
      console.error("Exit fullscreen error:", err);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (checkFullscreen()) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [checkFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);

    // Check initial state
    setIsFullscreen(checkFullscreen());

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
    };
  }, [checkFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
