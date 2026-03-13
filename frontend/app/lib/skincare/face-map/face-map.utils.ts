/**
 * Coordinate utilities for the frontal face map (SVG). All positions use 0–100 percent.
 */

/**
 * Convert client click coordinates to percent (0–100) relative to the face container rect.
 */
export function clientToFacePercent(
  rect: DOMRect,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

/**
 * Convert percent (0–100) to client coordinates relative to the face container rect.
 * Useful for positioning overlay elements if needed.
 */
export function facePercentToClient(
  rect: DOMRect,
  xPercent: number,
  yPercent: number
): { x: number; y: number } {
  return {
    x: rect.left + (rect.width * xPercent) / 100,
    y: rect.top + (rect.height * yPercent) / 100,
  };
}

/**
 * Marker position for API: we send x, y as 0–100 (percent) and z = 0.
 */
export function percentToApiPosition(p: { x: number; y: number }): { x: number; y: number; z: number } {
  return { x: p.x, y: p.y, z: 0 };
}

/**
 * Convert a click on a displayed photo (frontal face) to face map percent (0–100).
 * Assumes the face is roughly in the center 60% (width) x 75% (height) of the image.
 * Use when importing markers from a workspace photo (object-fit: contain).
 */
export function imageClickToFacePercent(
  imgRect: DOMRect,
  naturalWidth: number,
  naturalHeight: number,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) return { x: 50, y: 50 };
  const scale = Math.min(imgRect.width / naturalWidth, imgRect.height / naturalHeight);
  const contentWidth = naturalWidth * scale;
  const contentHeight = naturalHeight * scale;
  const contentLeft = imgRect.left + (imgRect.width - contentWidth) / 2;
  const contentTop = imgRect.top + (imgRect.height - contentHeight) / 2;
  const imgX = clientX - contentLeft;
  const imgY = clientY - contentTop;
  const faceW = contentWidth * 0.6;
  const faceH = contentHeight * 0.75;
  const faceLeft = (contentWidth - faceW) / 2;
  const faceTop = (contentHeight - faceH) / 2;
  const x = ((imgX - faceLeft) / faceW) * 100;
  const y = ((imgY - faceTop) / faceH) * 100;
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}
