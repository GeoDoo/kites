"use client";

interface AlignmentGuidesProps {
  showVerticalCenter: boolean;
  showHorizontalCenter: boolean;
  showTop: boolean;
  showBottom: boolean;
  showLeft: boolean;
  showRight: boolean;
}

/**
 * AlignmentGuides Component
 * Renders alignment guide lines on the canvas when dragging blocks
 */
export function AlignmentGuides({
  showVerticalCenter,
  showHorizontalCenter,
  showTop,
  showBottom,
  showLeft,
  showRight,
}: AlignmentGuidesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Vertical center guide */}
      {showVerticalCenter && (
        <div
          className="absolute top-0 bottom-0 w-px bg-sky-500"
          style={{ left: "50%" }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-sky-500 text-white text-[10px] rounded">
            50%
          </div>
        </div>
      )}

      {/* Horizontal center guide */}
      {showHorizontalCenter && (
        <div
          className="absolute left-0 right-0 h-px bg-sky-500"
          style={{ top: "50%" }}
        >
          <div className="absolute left-2 top-1/2 -translate-y-1/2 px-1 py-0.5 bg-sky-500 text-white text-[10px] rounded">
            50%
          </div>
        </div>
      )}

      {/* Top edge guide */}
      {showTop && (
        <div className="absolute left-0 right-0 top-0 h-px bg-emerald-400" />
      )}

      {/* Bottom edge guide */}
      {showBottom && (
        <div className="absolute left-0 right-0 bottom-0 h-px bg-emerald-400" />
      )}

      {/* Left edge guide */}
      {showLeft && (
        <div className="absolute top-0 bottom-0 left-0 w-px bg-emerald-400" />
      )}

      {/* Right edge guide */}
      {showRight && (
        <div className="absolute top-0 bottom-0 right-0 w-px bg-emerald-400" />
      )}
    </div>
  );
}

/**
 * Calculate which guides to show based on block position
 * Also returns snapped position if within threshold
 */
export function calculateGuides(
  x: number,
  y: number,
  width: number,
  height: number,
  threshold: number = 2
): {
  guides: AlignmentGuidesProps;
  snappedX: number;
  snappedY: number;
} {
  const blockCenterX = x + width / 2;
  const blockCenterY = y + height / 2;
  const blockRight = x + width;
  const blockBottom = y + height;

  let snappedX = x;
  let snappedY = y;

  const guides: AlignmentGuidesProps = {
    showVerticalCenter: false,
    showHorizontalCenter: false,
    showTop: false,
    showBottom: false,
    showLeft: false,
    showRight: false,
  };

  // Check vertical center (block center at 50%)
  if (Math.abs(blockCenterX - 50) < threshold) {
    guides.showVerticalCenter = true;
    snappedX = 50 - width / 2;
  }

  // Check horizontal center (block center at 50%)
  if (Math.abs(blockCenterY - 50) < threshold) {
    guides.showHorizontalCenter = true;
    snappedY = 50 - height / 2;
  }

  // Check left edge at 0%
  if (Math.abs(x) < threshold) {
    guides.showLeft = true;
    snappedX = 0;
  }

  // Check right edge at 100%
  if (Math.abs(blockRight - 100) < threshold) {
    guides.showRight = true;
    snappedX = 100 - width;
  }

  // Check top edge at 0%
  if (Math.abs(y) < threshold) {
    guides.showTop = true;
    snappedY = 0;
  }

  // Check bottom edge at 100%
  if (Math.abs(blockBottom - 100) < threshold) {
    guides.showBottom = true;
    snappedY = 100 - height;
  }

  // Also check for common positions (10%, 25%, 75%, 90%)
  const commonPositions = [10, 25, 75, 90];
  
  for (const pos of commonPositions) {
    if (Math.abs(x - pos) < threshold) snappedX = pos;
    if (Math.abs(blockCenterX - pos) < threshold) snappedX = pos - width / 2;
    if (Math.abs(y - pos) < threshold) snappedY = pos;
    if (Math.abs(blockCenterY - pos) < threshold) snappedY = pos - height / 2;
  }

  return { guides, snappedX, snappedY };
}
