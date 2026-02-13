import React, { useState } from 'react';
import { Modal, Button } from '../common';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import { UrlData } from './UrlCard';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlData | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  if (!url) return null;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qr-${url.shortCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.drawImage(img, 0, 0);

      // Convert canvas to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `qr-${url.shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              QR Code
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {url.shortUrl}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-6">
          {/* QR Code */}
          <div
            className="p-8 rounded-xl"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              id="qr-code-svg"
              value={url.shortUrl}
              size={qrSize}
              fgColor={qrColor}
              bgColor={bgColor}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Customization Options */}
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Size: {qrSize}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="64"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Foreground Color */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  QR Color
                </label>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="primary"
              onClick={handleDownloadPNG}
              className="flex-1"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            >
              Download PNG
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="flex-1"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            >
              Download SVG
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
