import { useEffect, useRef, useCallback, useState } from 'react';
import { Canvas as FabricCanvas, FabricText } from 'fabric';
import { EmbroideryText } from '@/lib/fabricEmbroidery';
import type { TextStyle } from '@/types/hat';

export interface FabricCanvasHandle {
  canvas: FabricCanvas | null;
  /** Add or update the main front text object */
  setText: (text: string, options?: {
    fill?: string;
    fontFamily?: string;
    textStyle?: TextStyle;
  }) => void;
  /** Remove all objects */
  clear: () => void;
  /** Get the underlying HTMLCanvasElement for THREE.CanvasTexture */
  getElement: () => HTMLCanvasElement | null;
  /** Force a render */
  render: () => void;
}

const CANVAS_SIZE = 2048;

export default function useFabricCanvas(hatColor: string): FabricCanvasHandle {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const elRef = useRef<HTMLCanvasElement | null>(null);
  const textObjRef = useRef<FabricText | null>(null);
  const hatColorRef = useRef(hatColor);
  hatColorRef.current = hatColor;

  // Create offscreen Fabric canvas once
  useEffect(() => {
    const el = document.createElement('canvas');
    el.width = CANVAS_SIZE;
    el.height = CANVAS_SIZE;
    elRef.current = el;

    const fc = new FabricCanvas(el, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: hatColorRef.current,
      renderOnAddRemove: true,
      selection: true,
    });

    canvasRef.current = fc;
    setCanvas(fc);

    return () => {
      fc.dispose();
      canvasRef.current = null;
      setCanvas(null);
      elRef.current = null;
      textObjRef.current = null;
    };
  }, []);

  // Update background color when hatColor changes
  useEffect(() => {
    const fc = canvasRef.current;
    if (!fc) return;
    fc.backgroundColor = hatColor;
    fc.requestRenderAll();
  }, [hatColor]);

  const setText = useCallback((text: string, options?: {
    fill?: string;
    fontFamily?: string;
    textStyle?: TextStyle;
  }) => {
    const fc = canvasRef.current;
    if (!fc) return;

    const lines = text.split('\n').filter(Boolean);
    const displayText = lines.join('\n');

    if (!displayText) {
      if (textObjRef.current) {
        fc.remove(textObjRef.current);
        textObjRef.current = null;
      }
      fc.requestRenderAll();
      return;
    }

    const fill = options?.fill || '#FFD700';
    const fontFamily = options?.fontFamily || 'Vinegar';
    const textStyle = options?.textStyle || 'flat';

    // Calculate font size based on text length
    const maxLen = Math.max(...lines.map(l => l.length));
    const lineCount = lines.length;
    const fontSize = lineCount === 1
      ? (maxLen > 15 ? 140 : maxLen > 10 ? 170 : 200)
      : lineCount === 2
        ? (maxLen > 12 ? 125 : maxLen > 8 ? 155 : 180)
        : (maxLen > 10 ? 110 : 140);

    const needsEmbroidery = textStyle !== 'flat';
    const currentIsEmbroidery = textObjRef.current instanceof EmbroideryText;

    // If text style type changed, remove old and create new
    if (textObjRef.current && needsEmbroidery !== currentIsEmbroidery) {
      fc.remove(textObjRef.current);
      textObjRef.current = null;
    }

    if (textObjRef.current) {
      // Update existing
      textObjRef.current.set({
        text: displayText,
        fill,
        fontFamily,
        fontSize,
      });
      if (textObjRef.current instanceof EmbroideryText) {
        textObjRef.current.textStyle = textStyle;
      }
      textObjRef.current.set({
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
      });
      textObjRef.current.setCoords();
    } else {
      const commonOpts = {
        fontSize,
        fontWeight: '900' as const,
        fontFamily,
        fill,
        textAlign: 'center' as const,
        originX: 'center' as const,
        originY: 'center' as const,
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: true,
      };

      let textObj: FabricText;
      if (needsEmbroidery) {
        textObj = new EmbroideryText(displayText, {
          ...commonOpts,
          textStyle,
        });
      } else {
        textObj = new FabricText(displayText, commonOpts);
      }
      fc.add(textObj);
      textObjRef.current = textObj;
    }

    fc.requestRenderAll();
  }, []);

  const clear = useCallback(() => {
    const fc = canvasRef.current;
    if (!fc) return;
    fc.clear();
    textObjRef.current = null;
    fc.backgroundColor = hatColorRef.current;
    fc.requestRenderAll();
  }, []);

  const getElement = useCallback(() => {
    const fc = canvasRef.current;
    if (!fc) return null;
    return fc.getElement() as HTMLCanvasElement;
  }, []);

  const render = useCallback(() => {
    canvasRef.current?.requestRenderAll();
  }, []);

  return {
    canvas,
    setText,
    clear,
    getElement,
    render,
  };
}
