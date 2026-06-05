"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  FileWarning,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Bundle the pdf.js worker locally (no CDN dependency — works on intranet).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;
// Max rendered page width (CSS px) at scale 1, so pages don't get huge on wide screens.
const BASE_MAX_WIDTH = 850;

interface PdfViewerProps {
  url: string;
  title?: string;
  downloadUrl?: string;
  downloadName?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function PdfViewer({
  url,
  title,
  downloadUrl,
  downloadName,
  isFullscreen,
  onToggleFullscreen,
}: PdfViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  // height / width of the current page (default ~A4 portrait until measured).
  const [pageAspect, setPageAspect] = useState(1.414);
  const [error, setError] = useState(false);

  // Stable reference so react-pdf doesn't reload the document on every render.
  const file = useMemo(() => ({ url }), [url]);

  // Track the stage size to fit the page responsively.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      setStageWidth(el.clientWidth);
      setStageHeight(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPageInput("1");
  }, []);

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.min(Math.max(1, n), numPages || 1);
      setPageNumber(clamped);
      setPageInput(String(clamped));
    },
    [numPages]
  );

  const prev = useCallback(() => goTo(pageNumber - 1), [goTo, pageNumber]);
  const next = useCallback(() => goTo(pageNumber + 1), [goTo, pageNumber]);

  // Keyboard navigation: ← / → for pages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
      else if (e.key === "ArrowRight" || e.key === "PageDown") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const commitInput = () => {
    const n = parseInt(pageInput, 10);
    if (Number.isNaN(n)) setPageInput(String(pageNumber));
    else goTo(n);
  };

  // Read the current page's real aspect ratio so we can fit it to the screen.
  const onPageLoad = useCallback(
    (page: { originalWidth: number; originalHeight: number }) => {
      if (page.originalWidth > 0) {
        setPageAspect(page.originalHeight / page.originalWidth);
      }
    },
    []
  );

  // At scale 1 the whole page fits inside the stage (SlideShare-style);
  // zooming in past 1 enlarges it and lets the user scroll.
  const pageWidth = useMemo(() => {
    if (!stageWidth || !stageHeight) return BASE_MAX_WIDTH * scale;
    const availW = stageWidth - 48; // horizontal breathing room
    const availH = stageHeight - 48; // vertical breathing room
    const fitWidth = Math.min(availW, availH / pageAspect, BASE_MAX_WIDTH);
    return Math.max(fitWidth, 240) * scale;
  }, [stageWidth, stageHeight, pageAspect, scale]);

  const zoomIn = () =>
    setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-neutral-200">
      {/* Top toolbar: title + pagination + zoom + download + fullscreen. */}
      <div className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-2 pr-12">
        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">
          {title}
        </div>

        {numPages > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={prev}
              disabled={pageNumber <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-black/5 disabled:opacity-40"
              aria-label="Өмнөх хуудас"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-neutral-700">
              <input
                value={pageInput}
                onChange={(e) =>
                  setPageInput(e.target.value.replace(/[^0-9]/g, ""))
                }
                onBlur={commitInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitInput();
                    e.currentTarget.blur();
                  }
                }}
                inputMode="numeric"
                aria-label="Хуудас руу очих"
                className="h-8 w-12 rounded-md border border-black/10 bg-white text-center tabular-nums outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <span className="tabular-nums text-neutral-500">/ {numPages}</span>
            </div>
            <button
              type="button"
              onClick={next}
              disabled={pageNumber >= numPages}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-black/5 disabled:opacity-40"
              aria-label="Дараах хуудас"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="mx-1 h-5 w-px bg-black/10" />

            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-black/5 disabled:opacity-40"
              aria-label="Багасгах"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-11 text-center text-xs tabular-nums text-neutral-600">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-black/5 disabled:opacity-40"
              aria-label="Томруулах"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {(downloadUrl || onToggleFullscreen) && (
          <span className="mx-1 hidden h-5 w-px shrink-0 bg-black/10 sm:block" />
        )}

        <div className="flex shrink-0 items-center gap-1">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={downloadName}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-black/5"
              aria-label="Татаж авах"
              title="Татаж авах"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-black/5"
              aria-label={isFullscreen ? "Багасгах" : "Бүтэн дэлгэц"}
              title={isFullscreen ? "Багасгах" : "Бүтэн дэлгэц"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stage — single page, centered, Scribd-style white page on gray. */}
      <div ref={stageRef} className="min-h-0 flex-1 overflow-auto">
        <div className="flex min-h-full items-start justify-center p-6">
          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            onLoadError={() => setError(true)}
            loading={
              <div className="flex items-center justify-center py-24 text-neutral-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center gap-2 py-24 text-neutral-500">
                <FileWarning className="h-8 w-8" />
                <span className="text-sm">PDF-ийг ачаалахад алдаа гарлаа</span>
              </div>
            }
          >
            {!error && numPages > 0 && (
              <div className="shadow-xl shadow-black/15 ring-1 ring-black/5">
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  onLoadSuccess={onPageLoad}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div
                      className="flex items-center justify-center bg-white"
                      style={{ width: pageWidth, height: pageWidth * 1.3 }}
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                  }
                />
              </div>
            )}
          </Document>
        </div>
      </div>

      {/* Large click zones to flip pages (Scribd/SlideShare feel). */}
      {numPages > 0 && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={pageNumber <= 1}
            aria-label="Өмнөх хуудас"
            className="group absolute left-0 top-14 bottom-0 flex w-16 items-center justify-center disabled:pointer-events-none"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-700 opacity-0 shadow-md transition group-hover:opacity-100 group-disabled:opacity-0">
              <ChevronLeft className="h-5 w-5" />
            </span>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={pageNumber >= numPages}
            aria-label="Дараах хуудас"
            className="group absolute right-0 top-14 bottom-0 flex w-16 items-center justify-center disabled:pointer-events-none"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-700 opacity-0 shadow-md transition group-hover:opacity-100 group-disabled:opacity-0">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </>
      )}

    </div>
  );
}
