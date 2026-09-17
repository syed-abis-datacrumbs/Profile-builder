import { describe, test, expect } from 'bun:test';
import { paginateCvSmart, PAGE_HEIGHT_PX, PAGE_MARGIN_PX, PAGE_SAFETY_PX } from './cvPagination';

describe('paginateCvSmart Pagination System', () => {
  test('fits content within a single A4 page when total height is small', () => {
    const blocks = [
      { top: 0, bottom: 50 },
      { top: 60, bottom: 150 },
      { top: 160, bottom: 300 },
    ];
    const pages = paginateCvSmart(400, blocks);

    expect(pages).toHaveLength(1);
    expect(pages[0].sliceStart).toBe(0);
    expect(pages[0].sliceHeight).toBe(PAGE_HEIGHT_PX);
    expect(pages[0].topOffset).toBe(0);
  });

  test('shifts a straddling block cleanly to page 2 instead of cutting through it', () => {
    // Page 1 cutoff height: PAGE_HEIGHT_PX - 0 - PAGE_MARGIN_PX - PAGE_SAFETY_PX
    const page1End = PAGE_HEIGHT_PX - PAGE_MARGIN_PX - PAGE_SAFETY_PX; // 1069px

    const blocks = [
      { top: 0, bottom: 100 },
      { top: 110, bottom: 500 },
      { top: 510, bottom: 1040 }, // Fits on page 1
      { top: 1050, bottom: 1090 }, // Straddles page 1 boundary (top 1050 < 1069 < bottom 1090)
      { top: 1100, bottom: 1200 },
    ];

    const pages = paginateCvSmart(1300, blocks);

    expect(pages.length).toBeGreaterThan(1);
    // Page 1 should break at top of the straddling block (1050px)
    expect(pages[0].sliceStart).toBe(0);
    expect(pages[0].sliceHeight).toBe(1050);

    // Page 2 should start at 1050px
    expect(pages[1].sliceStart).toBe(1050);
    expect(pages[1].topOffset).toBe(PAGE_MARGIN_PX);
  });

  test('handles multi-page pagination with correct topOffsets and sliceStarts', () => {
    const blocks = [
      { top: 0, bottom: 900 },
      { top: 910, bottom: 1050 }, // Ends at 1050, fits on page 1 (cutoff 1069)
      { top: 1060, bottom: 1200 }, // Straddles 1069 -> shifts to page 2
      { top: 1210, bottom: 1900 },
      { top: 1910, bottom: 2200 }, // Straddles page 2 cutoff -> shifts to page 3
    ];

    const pages = paginateCvSmart(2300, blocks);

    expect(pages.length).toBe(3);
    expect(pages[0].sliceStart).toBe(0);
    expect(pages[0].sliceHeight).toBe(1060);

    expect(pages[1].sliceStart).toBe(1060);
    expect(pages[1].topOffset).toBe(PAGE_MARGIN_PX);

    expect(pages[2].sliceStart).toBeGreaterThan(1050);
    expect(pages[2].topOffset).toBe(PAGE_MARGIN_PX);
  });
});
