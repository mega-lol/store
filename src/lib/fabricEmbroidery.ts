import { FabricText, classRegistry } from 'fabric';
import type { TextStyle } from '@/types/hat';

/**
 * Custom Fabric text class that renders embroidery-style effects.
 * Ports the drawGoldEmbroidery, drawEmbroideryStitch, and draw3DPuff
 * canvas effects from HatModel.tsx into Fabric's rendering pipeline.
 */
export class EmbroideryText extends FabricText {
  declare textStyle: TextStyle;

  static type = 'EmbroideryText';

  constructor(text: string, options?: any) {
    super(text, options);
    this.textStyle = options?.textStyle || 'flat';
  }

  /**
   * Override Fabric's _renderTextCommon to apply embroidery effects.
   * We hook into _renderText to wrap the char/line rendering with style effects.
   */
  _render(ctx: CanvasRenderingContext2D): void {
    if (this.textStyle === 'flat') {
      super._render(ctx);
      return;
    }

    // For embroidery styles, we render the text ourselves
    // using the full text content and Fabric's computed position
    ctx.save();
    this._setTextStyles(ctx);

    const text = this.text || '';
    const lines = text.split('\n');
    const fontSize = this.fontSize || 40;
    const fill = (this.fill as string) || '#FFD700';
    const lineHeight = fontSize * (this.lineHeight || 1.16);

    ctx.font = `${this.fontWeight || '900'} ${fontSize}px ${this.fontFamily || 'Vinegar'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const totalHeight = lines.length * lineHeight;
    const startY = -(totalHeight / 2) + lineHeight / 2;

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;
      const x = 0; // centered at origin

      switch (this.textStyle) {
        case 'gold-embroidery':
          this._drawGoldEmbroidery(ctx, line, x, y, fontSize);
          break;
        case 'embroidery':
          this._drawEmbroideryStitch(ctx, line, x, y, fontSize, fill);
          break;
        case 'puff-3d':
          this._draw3DPuff(ctx, line, x, y, fontSize, fill);
          break;
      }
    });

    ctx.restore();
  }

  private _setTextStyles(ctx: CanvasRenderingContext2D): void {
    const fontSize = this.fontSize || 40;
    ctx.font = `${this.fontWeight || '900'} ${fontSize}px ${this.fontFamily || 'Vinegar'}`;
  }

  private _drawEmbroideryStitch(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
  ): void {
    const offsets = [
      { dx: 0, dy: -1.5, alpha: 0.3 },
      { dx: -1, dy: -1, alpha: 0.2 },
      { dx: 1, dy: -1, alpha: 0.2 },
      { dx: 0, dy: 1.5, alpha: 0.15 },
    ];

    for (const { dx, dy, alpha } of offsets) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000000';
      ctx.fillText(text, x + dx, y + dy);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  private _drawGoldEmbroidery(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
  ): void {
    const goldGrad = ctx.createLinearGradient(0, y - fontSize * 0.6, 0, y + fontSize * 0.6);
    goldGrad.addColorStop(0, '#FFE850');
    goldGrad.addColorStop(0.15, '#FFD000');
    goldGrad.addColorStop(0.35, '#E8A000');
    goldGrad.addColorStop(0.5, '#FFD000');
    goldGrad.addColorStop(0.65, '#CC8800');
    goldGrad.addColorStop(0.85, '#FFD000');
    goldGrad.addColorStop(1, '#FFE850');

    // Embossed shadow layers
    for (let i = 5; i >= 1; i--) {
      ctx.globalAlpha = 0.3 + (5 - i) * 0.06;
      ctx.fillStyle = '#1A0E00';
      ctx.fillText(text, x + i * 0.5, y + i * 1.4);
    }

    // Side emboss
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#3D2200';
    ctx.fillText(text, x + 1.5, y + fontSize * 0.05);
    ctx.fillText(text, x + 1, y + fontSize * 0.07);

    // Thread texture
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    for (let sdy = -2; sdy <= 2; sdy += 2) {
      for (let sdx = -2; sdx <= 2; sdx += 2) {
        if (sdx === 0 && sdy === 0) continue;
        ctx.fillText(text, x + sdx, y + sdy);
      }
    }

    // Main gold fill
    ctx.globalAlpha = 1;
    ctx.fillStyle = goldGrad;
    ctx.fillText(text, x, y);
    ctx.fillText(text, x, y);

    // Yellow overlay
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFD700';
    ctx.fillText(text, x, y);

    // Top-edge highlight
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#FFF8C0';
    ctx.fillText(text, x, y - fontSize * 0.025);

    // Metallic shine
    ctx.save();
    ctx.globalAlpha = 0.3;
    const shineGrad = ctx.createLinearGradient(0, y - fontSize * 0.2, 0, y + fontSize * 0.1);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shineGrad.addColorStop(0.35, 'rgba(255,255,220,0.9)');
    shineGrad.addColorStop(0.55, 'rgba(255,240,160,0.6)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.fillText(text, x, y);
    ctx.restore();

    // Dark-gold outline
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#9B7018';
    ctx.lineWidth = Math.max(2.5, fontSize * 0.018);
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.globalAlpha = 1;
  }

  private _draw3DPuff(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
  ): void {
    // Deep shadow
    for (let i = 6; i >= 1; i--) {
      ctx.globalAlpha = 0.15 + (6 - i) * 0.05;
      ctx.fillStyle = '#000000';
      ctx.fillText(text, x, y + i * 1.5);
    }

    // Side depth
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#222222';
    for (let i = 3; i >= 1; i--) {
      ctx.fillText(text, x + i * 0.5, y + i * 1.2);
    }

    // Main color
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    // Top highlight
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y - fontSize * 0.02);
    ctx.globalAlpha = 1;
  }
}

// Register the custom class so Fabric can serialize/deserialize
classRegistry.setClass(EmbroideryText);
