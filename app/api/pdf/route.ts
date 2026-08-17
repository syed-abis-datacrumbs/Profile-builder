import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // allow up to 60 s for Puppeteer

export async function POST(req: NextRequest) {
  try {
    const { html, css = '', name = 'Resume' } = await req.json() as {
      html: string;
      css?: string;
      name?: string;
    };

    if (!html) {
      return NextResponse.json({ error: 'html is required' }, { status: 400 });
    }

    // ── Resolve Chromium executable ──────────────────────────────────────────
    // On Vercel / Lambda we use @sparticuz/chromium.
    // In local dev we fall back to the system Chrome on the developer's Mac.
    let executablePath: string;
    let chromiumArgs: string[];

    const isLambda =
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL ||
      process.env.NODE_ENV === 'production';

    if (isLambda) {
      const chromium = (await import('@sparticuz/chromium')).default;
      executablePath = await chromium.executablePath();
      chromiumArgs = chromium.args;
    } else {
      // macOS default Chrome path (works without any extra downloads)
      executablePath =
        process.env.CHROMIUM_PATH ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      chromiumArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ];
    }

    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      executablePath,
      args: chromiumArgs,
      headless: true,
    });

    const page = await browser.newPage();

    // Build a full self-contained HTML document with Tailwind + Fonts
    const fullHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
    <!-- Google Fonts used by the resume -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Georgia&display=swap" rel="stylesheet" />
    <!-- Tailwind CSS CDN — scans class names and generates all utilities -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: white; }
      /* Extra inline styles captured from the running page */
      ${css}
    </style>
  </head>
  <body style="background:white;">
    ${html}
  </body>
</html>`;

    // Emulate screen so Tailwind utility classes apply (they're screen-targeted)
    await page.emulateMediaType('screen');
    await page.setViewport({ width: 850, height: 1200, deviceScaleFactor: 1 });
    await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Give Tailwind CDN a moment to finish generating all CSS from the DOM
    await new Promise((r) => setTimeout(r, 1500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '0', right: '0' },
    });

    await browser.close();

    // Stream the PDF directly as a download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('[PDF API] Error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed', detail: String(err) },
      { status: 500 }
    );
  }
}
