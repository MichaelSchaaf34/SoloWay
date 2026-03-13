import { QRCodeSVG } from 'qrcode.react';

export default function QRDisplay({ url, size = 200 }) {
  if (!url) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
