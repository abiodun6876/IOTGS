import React, { useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onResult: (ip: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onResult }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
  const scanner = new Html5Qrcode('reader');
  scannerRef.current = scanner;
  setIsScanning(true);

  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length) {
      // Prefer back camera if available
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back')
      ) || devices[0];

      const cameraId = backCamera.id;

      await scanner.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          const ipMatch = decodedText.match(/http:\/\/([\d.]+):\d+/);
          if (ipMatch) {
            const ip = ipMatch[1];
            localStorage.setItem('scanned_ip', ip);
            onResult(ip);
            stopScanner(); // Stop after successful scan
          }
        },
        (err) => console.warn('Scan error:', err)
      );
    } else {
      console.error('No cameras found.');
    }
  } catch (err) {
    console.error('Camera error:', err);
  }
};


  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-4 text-center">
      {!isScanning && (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Start QR Scan
        </button>
      )}

      <div id="reader" className={`min-h-[300px] ${isScanning ? 'block' : 'hidden'}`} />

      {isScanning && (
        <button
          onClick={stopScanner}
          className="mt-4 text-sm text-red-600 underline"
        >
          Stop Scanner
        </button>
      )}
    </div>
  );
};
