'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

// Same interaction model as the DataCrumbs LMS's linkedin-builder pfp
// cropper (PfpCompositorCanvas.tsx / linkedinExport.ts's drawPfpEditorPreview
// + pfpOffsetBounds): the whole uploaded photo is drawn cover-scaled behind a
// circular crop guide, with everything outside that circle dimmed; the user
// drags to reposition and a slider to zoom, clamped so the photo can never
// reveal a gap at the circle's edge. "Use this photo" bakes the current
// zoom/position into a plain square PNG — that's what gets used as the
// headshot everywhere else, so the position the user picked here is exactly
// what ends up on the cover/avatar, not a fixed CSS object-position guess.
const SLOT_SIZE = 500;
const PAD = SLOT_SIZE * 0.4;
const CANVAS_SIZE = SLOT_SIZE + PAD * 2;
const DISPLAY_PX = 280;

function coverScale(imgW: number, imgH: number, slotW: number, slotH: number): number {
  return Math.max(slotW / imgW, slotH / imgH);
}

function offsetBounds(imgW: number, imgH: number, zoom: number): { maxX: number; maxY: number } {
  const scale = coverScale(imgW, imgH, SLOT_SIZE, SLOT_SIZE) * zoom;
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  return { maxX: Math.max(0, (drawW - SLOT_SIZE) / 2), maxY: Math.max(0, (drawH - SLOT_SIZE) / 2) };
}

interface PfpCropModalProps {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
  onChangePhoto: (file: File) => void;
}

export const PfpCropModal: React.FC<PfpCropModalProps> = ({ imageUrl, onCancel, onConfirm, onChangePhoto }) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const changeInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  // Re-mounted (via `key={imageUrl}` on the caller) whenever a new photo is
  // picked, so zoom/offset's initial useState values are the only reset
  // needed — no imperative setState-on-mount required here.
  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const slotCx = PAD + SLOT_SIZE / 2;
    const slotCy = PAD + SLOT_SIZE / 2;
    const scale = coverScale(img.width, img.height, SLOT_SIZE, SLOT_SIZE) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(img, slotCx + offset.x - drawW / 2, slotCy + offset.y - drawH / 2, drawW, drawH);

    // Dim everywhere except the crop circle in one pass (evenodd fill of the
    // outer rect + the inner circle) so the photo underneath the circle
    // stays untouched at full brightness.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const r = SLOT_SIZE / 2;
    ctx.moveTo(slotCx + r, slotCy);
    ctx.arc(slotCx, slotCy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fill('evenodd');
    ctx.restore();

    ctx.beginPath();
    ctx.arc(slotCx, slotCy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, CANVAS_SIZE * 0.004);
    ctx.stroke();
  }, [img, zoom, offset]);

  const clamp = (x: number, y: number, z: number) => {
    if (!img) return { x, y };
    const b = offsetBounds(img.width, img.height, z);
    return { x: Math.min(b.maxX, Math.max(-b.maxX, x)), y: Math.min(b.maxY, Math.max(-b.maxY, y)) };
  };

  const handleZoom = (z: number) => {
    setZoom(z);
    setOffset((prev) => clamp(prev.x, prev.y, z));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!img) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, offsetX: offset.x, offsetY: offset.y };
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const scaleFactor = CANVAS_SIZE / DISPLAY_PX;
    const dx = (e.clientX - drag.startX) * scaleFactor;
    const dy = (e.clientY - drag.startY) * scaleFactor;
    setOffset(clamp(drag.offsetX + dx, drag.offsetY + dy, zoom));
  };
  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleConfirm = () => {
    if (!img) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = SLOT_SIZE;
    exportCanvas.height = SLOT_SIZE;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    const scale = coverScale(img.width, img.height, SLOT_SIZE, SLOT_SIZE) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(img, SLOT_SIZE / 2 + offset.x - drawW / 2, SLOT_SIZE / 2 + offset.y - drawH / 2, drawW, drawH);
    onConfirm(exportCanvas.toDataURL('image/png'));
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Position your photo</h3>
        <p className="text-xs text-slate-500 mb-4">
          For best results, upload a professional headshot with the background removed.
        </p>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{ width: DISPLAY_PX, height: DISPLAY_PX, touchAction: 'none', cursor: 'grab' }}
            className="rounded-lg"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Drag to reposition — the dimmed area is what gets cropped away
        </p>

        <div className="flex items-center gap-3 mt-4">
          <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(parseFloat(e.target.value))}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        <div className="text-center mt-3">
          <label className="text-xs font-semibold text-[#0A66C2] hover:underline cursor-pointer">
            Change photo
            <input
              ref={changeInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChangePhoto(file);
              }}
            />
          </label>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!img}
            className="flex-1 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#0958A8] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Use this photo
          </button>
        </div>
      </div>
    </div>
  );
};
