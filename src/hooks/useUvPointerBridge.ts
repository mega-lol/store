import { useCallback, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Canvas as FabricCanvas, Point } from 'fabric';

const CANVAS_SIZE = 2048;

export interface UvPointerBridgeHandlers {
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
}

interface UseUvPointerBridgeOptions {
  fabricCanvas: FabricCanvas | null;
  canvasSize?: number;
  onFabricHit?: (hit: boolean) => void;
}

function uvToCanvas(uvX: number, uvY: number, size: number): { x: number; y: number } {
  return {
    x: uvX * size,
    y: (1 - uvY) * size,
  };
}

function dispatchToFabric(
  fc: FabricCanvas,
  type: string,
  canvasX: number,
  canvasY: number,
) {
  const upperEl = (fc as any).upperCanvasEl as HTMLCanvasElement | undefined;
  if (!upperEl) return;

  // Override getBoundingClientRect for the offscreen canvas so Fabric computes correct coords
  const origGetBCR = upperEl.getBoundingClientRect;
  try {
    upperEl.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: CANVAS_SIZE,
      bottom: CANVAS_SIZE,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      x: 0,
      y: 0,
      toJSON() { return this; },
    });

    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: canvasX,
      clientY: canvasY,
      button: 0,
    });

    upperEl.dispatchEvent(evt);
  } finally {
    upperEl.getBoundingClientRect = origGetBCR;
  }
}

/** Check if any Fabric object contains the given canvas-space point */
function hitTestFabric(fc: FabricCanvas, x: number, y: number): boolean {
  const point = new Point(x, y);
  const objects = fc.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    if (objects[i].containsPoint(point)) return true;
  }
  return false;
}

export default function useUvPointerBridge({
  fabricCanvas,
  canvasSize = CANVAS_SIZE,
  onFabricHit,
}: UseUvPointerBridgeOptions): UvPointerBridgeHandlers {
  const draggingRef = useRef(false);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!fabricCanvas || !e.uv) return;

    const { x, y } = uvToCanvas(e.uv.x, e.uv.y, canvasSize);

    // Check if there's a Fabric object at this position
    if (hitTestFabric(fabricCanvas, x, y)) {
      e.stopPropagation();
      draggingRef.current = true;
      onFabricHit?.(true);
      dispatchToFabric(fabricCanvas, 'mousedown', x, y);
    } else {
      onFabricHit?.(false);
      // Deselect any active Fabric objects
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
    }
  }, [fabricCanvas, canvasSize, onFabricHit]);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!fabricCanvas || !e.uv || !draggingRef.current) return;

    const { x, y } = uvToCanvas(e.uv.x, e.uv.y, canvasSize);
    dispatchToFabric(fabricCanvas, 'mousemove', x, y);
    e.stopPropagation();
  }, [fabricCanvas, canvasSize]);

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!fabricCanvas || !draggingRef.current) return;

    const uv = e.uv;
    if (uv) {
      const { x, y } = uvToCanvas(uv.x, uv.y, canvasSize);
      dispatchToFabric(fabricCanvas, 'mouseup', x, y);
    }

    draggingRef.current = false;
    onFabricHit?.(false);
  }, [fabricCanvas, canvasSize, onFabricHit]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
