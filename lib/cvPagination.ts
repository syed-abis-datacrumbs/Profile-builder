// Shared A4 pagination model — used by BOTH the on-screen paginated preview
// and the Puppeteer PDF export so the two can never drift apart.
// Ported from the LMS cv-generator pagination system.

// A4 at 96 dpi
export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;

// Blank breathing room at the BOTTOM of every page and TOP of every
// continuation page. First page top-spacing comes from CvPreview's own padding.
export const PAGE_MARGIN_PX = 72;

export interface CvPage {
  /** Content-pixel offset where this page's visible slice begins. */
  sliceStart: number;
  /** How many content-pixels this page shows (clip-window height). */
  sliceHeight: number;
  /** Blank space reserved above the content within this page's box. */
  topOffset: number;
}

export interface CvBlock {
  top: number;
  bottom: number;
}

/** Measures every `[data-cv-block]` inside `root` in CSS px relative to it. */
export function measureBlocks(root: HTMLElement): CvBlock[] {
  const rootTop = root.getBoundingClientRect().top;
  return Array.from(root.querySelectorAll<HTMLElement>('[data-cv-block]')).map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - rootTop, bottom: r.bottom - rootTop };
  });
}

/**
 * Paginates `contentHeight` px of resume content into A4 pages, never
 * cutting through a `[data-cv-block]` — if a block would straddle a page
 * bottom, the break is placed just before that block so it moves whole to the
 * next page. Identical algorithm used by both the preview and Puppeteer PDF.
 */
export function paginateCvSmart(contentHeight: number, blocks: CvBlock[]): CvPage[] {
  const sorted = [...blocks].sort((a, b) => a.top - b.top);
  const pages: CvPage[] = [];
  let sliceStart = 0;
  let isFirst = true;
  let guard = 0;

  do {
    const topOffset = isFirst ? 0 : PAGE_MARGIN_PX;
    const remaining = contentHeight - sliceStart;

    let breakAt: number;
    if (remaining <= PAGE_HEIGHT_PX - topOffset) {
      // Everything remaining fits on this page — it's the last page.
      breakAt = contentHeight;
    } else {
      const pageEnd = sliceStart + (PAGE_HEIGHT_PX - topOffset - PAGE_MARGIN_PX);
      let lastFittingBottom = 0;
      for (const b of sorted) {
        if (b.top >= sliceStart - 1 && b.bottom <= pageEnd && b.bottom > lastFittingBottom) {
          lastFittingBottom = b.bottom;
        }
      }
      if (lastFittingBottom > sliceStart) {
        breakAt = lastFittingBottom;
      } else {
        const straddler = sorted.find(
          (b) => b.top > sliceStart + 1 && b.top < pageEnd && b.bottom > pageEnd
        );
        breakAt = straddler ? straddler.top : pageEnd;
      }
    }

    const isLastPage = breakAt >= contentHeight - 0.5;
    pages.push({
      sliceStart,
      sliceHeight: isLastPage ? PAGE_HEIGHT_PX - topOffset : breakAt - sliceStart,
      topOffset,
    });
    sliceStart = breakAt;
    isFirst = false;
    guard++;
  } while (sliceStart < contentHeight - 1 && guard < 50);

  return pages;
}
