/**
 * useAREngine — Thin React bridge to the AR engine layer.
 *
 * This hook contains ZERO business logic.
 * It only:
 *   1. Detects the platform (via ARModeManager)
 *   2. Lazy-loads the correct engine
 *   3. Wires engine callbacks to React state
 *   4. Exposes start / dispose / resetPlacement to the UI
 *
 * All AR logic lives inside the engine classes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { detectPlatform, loadEngine, type DetectionResult } from "./ARModeManager";
import type { IAREngine, AREngineState, ARPlatform } from "./types";

export interface UseAREngineReturn {
  /** Detected platform */
  platform: ARPlatform | null;
  /** Detection reason string */
  detectionReason: string | null;
  /** Whether detection is still running */
  detecting: boolean;
  /** Current engine state */
  engineState: AREngineState;
  /** Error message */
  error: string | null;
  /** Start the engine */
  startEngine: () => Promise<void>;
  /** Dispose the engine */
  disposeEngine: () => void;
  /** Reset placed objects */
  resetPlacement: () => void;
  /** Container ref to attach to a div */
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useAREngine(options: {
  glb?: string;
  usdz?: string;
}): UseAREngineReturn {
  const containerRef = useRef<HTMLDivElement>(null!);
  const engineRef = useRef<IAREngine | null>(null);

  const [platform, setPlatform] = useState<ARPlatform | null>(null);
  const [detectionReason, setDetectionReason] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [engineState, setEngineState] = useState<AREngineState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Detect platform on mount
  useEffect(() => {
    let cancelled = false;
    detectPlatform().then((result: DetectionResult) => {
      if (cancelled) return;
      setPlatform(result.platform);
      setDetectionReason(result.reason);
      setDetecting(false);
    });
    return () => { cancelled = true; };
  }, []);

  const startEngine = useCallback(async () => {
    if (!platform || !containerRef.current) return;

    try {
      setError(null);
      const engine = await loadEngine(platform);
      engineRef.current = engine;

      await engine.init({
        container: containerRef.current,
        modelUrl: options.glb,
        usdzUrl: options.usdz,
        onStateChange: setEngineState,
        onError: setError,
      });

      await engine.start();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start AR engine";
      setError(errorMessage);
      setEngineState("error");
    }
  }, [platform]);

  const disposeEngine = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
    setEngineState("idle");
    setError(null);
  }, []);

  const resetPlacement = useCallback(() => {
    engineRef.current?.resetPlacement?.();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return {
    platform,
    detectionReason,
    detecting,
    engineState,
    error,
    startEngine,
    disposeEngine,
    resetPlacement,
    containerRef,
  };
}
