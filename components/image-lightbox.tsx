'use client';

import { useEffect, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onDownload: (src: string, fileName: string) => void;
}

export default function ImageLightbox({
  src,
  alt,
  onClose,
  onDownload,
}: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 5)); // Allow zooming up to 5x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls positioned on top of the image with higher z-index */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(src, alt);
          }}
          className="rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Image container without constraints */}
      <div onClick={(e) => e.stopPropagation()}>
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          className="object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-20">
        {alt}
      </div>
    </div>
  );
}
