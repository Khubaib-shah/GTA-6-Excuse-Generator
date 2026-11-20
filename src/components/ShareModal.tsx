import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Download, Share2, X } from 'lucide-react';
import type { ExcuseResult } from '../types/excuse';
import { buildShareFilename } from '../utils/shareCardLayout';
import type { RenderedShareCard } from '../utils/shareCardRenderer';

interface ShareModalProps {
  isOpen: boolean;
  card: RenderedShareCard | null;
  excuse: ExcuseResult;
  onClose: () => void;
}

export function ShareModal({ isOpen, card, excuse, onClose }: ShareModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [shared, setShared] = useState(false);

  const canNativeShareFile =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    card !== null &&
    (() => {
      try {
        const file = new File(
          [card.blob],
          buildShareFilename(excuse.persona, excuse.channel),
          { type: 'image/png' },
        );
        return navigator.canShare({ files: [file] });
      } catch {
        return false;
      }
    })();

  useEffect(() => {
    if (!isOpen) {
      setDownloaded(false);
      setShared(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !card || typeof document === 'undefined') {
    return null;
  }

  const handleDownload = () => {
    const filename = buildShareFilename(excuse.persona, excuse.channel);
    const url = URL.createObjectURL(card.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

  const handleNativeShare = async () => {
    const filename = buildShareFilename(excuse.persona, excuse.channel);
    try {
      const file = new File([card.blob], filename, { type: 'image/png' });
      await navigator.share({
        title: 'Sick Day VI: Leonida Sunset Excuse Postcard',
        text: 'Aaj ki GTA 6 launch day chhutti ready hai.',
        files: [file],
      });
      setShared(true);
      window.setTimeout(() => setShared(false), 2400);
    } catch {
      // Canceled or unsupported, ignore silently
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0712]/85 p-3 backdrop-blur-md sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-md flex-col gap-3.5 overflow-hidden rounded-2xl border border-white/14 bg-[#1A1528] p-4 text-white shadow-2xl sm:gap-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFB0C4]">
              SICK DAY VI
            </p>
            <h3
              id="share-modal-title"
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-0.5 text-xl font-extrabold tracking-[-0.02em] text-white sm:text-2xl"
            >
              Leonida Sunset Postcard
            </h3>
            <p className="mt-0.5 text-xs text-white/65">
              WhatsApp Status ya Stories pe share karne ke liye ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#110E1A] text-white transition-colors duration-150 hover:border-[#FFB0C4] hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:h-11 sm:w-11"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0A0712] p-2">
          <img
            src={card.dataUrl}
            alt="Leonida Sunset excuse postcard PNG preview"
            data-testid="share-card-image"
            className="max-h-[54dvh] w-auto rounded-lg object-contain sm:max-h-[56vh]"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#FFB0C4] px-5 py-2 text-sm font-bold text-[#110E1A] whitespace-nowrap transition-colors duration-150 hover:bg-[#FFC5D4] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download PNG</span>
              </>
            )}
          </button>

          {canNativeShareFile && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/8 px-5 py-2 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:border-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>{shared ? 'Shared' : 'Share'}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
