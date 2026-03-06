// WebXR type augmentations for Three.js
// These extend the built-in types for WebXR hit-test support

interface XRHitTestSource {
  cancel(): void;
}

interface XRHitTestResult {
  getPose(baseSpace: XRSpace): XRPose | null;
}

interface XRFrame {
  getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
}

interface XRSession {
  requestHitTestSource(options: {
    space: XRSpace;
  }): Promise<XRHitTestSource>;
}

interface XRReferenceSpace extends XRSpace {}
