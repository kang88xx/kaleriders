const modes = new Set(['pack', 'push', 'clear']);

// Columns of the wall on wide screens and on phones; an opened photo spans 10 x 7 or 8 x 5 cells.
export const wideColumns = 25;
export const compactColumns = 10;

// The canvas and ordinary square cells never change size when a photo opens.
export function fixedLayout({ width, count = 100, selected = -1, compact = false, mode = 'pack' }) {
  if (!Number.isFinite(width) || width <= 0) throw new RangeError('Frame width must be positive.');
  if (!Number.isInteger(count) || count < 0) throw new RangeError('Photo count must be a non-negative integer.');
  if (!modes.has(mode)) throw new RangeError('Unknown fixed gallery mode.');

  const columns = compact ? compactColumns : wideColumns;
  const rows = Math.ceil(count / columns);
  const cell = width / columns;
  const height = rows * cell;
  const square = index => ({
    x: (index % columns) * cell,
    y: Math.floor(index / columns) * cell,
    width: cell,
    height: cell,
    visible: true,
  });
  const rects = Array.from({ length: count }, (_, index) => square(index));
  const result = { width, height, cell, columns, rows, rects };
  if (!Number.isInteger(selected) || selected < 0 || selected >= count) return result;

  const spanColumns = compact ? 8 : 10;
  const spanRows = Math.min(rows, compact ? 5 : 7);
  const clamp = (value, maximum) => Math.max(0, Math.min(maximum, value));
  const anchorColumn = clamp(selected % columns - Math.floor((spanColumns - 1) / 2), columns - spanColumns);
  const anchorRow = clamp(Math.floor(selected / columns) - Math.floor((spanRows - 1) / 2), rows - spanRows);
  const reserved = index => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return column >= anchorColumn && column < anchorColumn + spanColumns
      && row >= anchorRow && row < anchorRow + spanRows;
  };

  if (mode === 'pack') {
    // Stable photo order fills all remaining slots; overflow photos disappear.
    const slots = Array.from({ length: count }, (_, index) => index).filter(index => !reserved(index));
    let nextSlot = 0;
    rects.forEach((rect, index) => {
      if (index === selected) return;
      const slot = slots[nextSlot++];
      if (slot === undefined) rect.visible = false;
      else Object.assign(rect, square(slot));
    });
  } else if (mode === 'push') {
    // Only intersecting rows move: preserve the left side, push the rest right.
    for (let row = anchorRow; row < anchorRow + spanRows; row++) {
      const first = row * columns + anchorColumn;
      const last = Math.min(count, (row + 1) * columns);
      let destination = row * columns + anchorColumn + spanColumns;
      for (let index = first; index < last; index++) {
        if (index === selected) continue;
        rects[index].visible = false;
        if (destination < last) Object.assign(rects[index], square(destination++));
      }
    }
  } else {
    rects.forEach((rect, index) => { if (reserved(index)) rect.visible = false; });
  }

  rects[selected] = {
    x: anchorColumn * cell,
    y: anchorRow * cell,
    width: spanColumns * cell,
    height: spanRows * cell,
    visible: true,
  };
  return result;
}
