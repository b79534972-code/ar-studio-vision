// AR Architecture — Public API
export type { IAREngine, AREngineConfig, AREngineState, ARPlatform } from "./types";
export { detectPlatform, loadEngine } from "./ARModeManager";
export { useAREngine, type UseAREngineReturn } from "./useAREngine";
