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
      if (devices.length) {
        const backCamera = devices.find(device =>
          device.label.toLowerCase().includes('back')
        ) || devices[0];

        await scanner.start(
          backCamera.id,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            const ipMatch = decodedText.match(/http:\/\/([\d.]+):\d+/);
            if (ipMatch) {
              const ip = ipMatch[1];
              localStorage.setItem('scanned_ip', ip);
              onResult(ip); // Pass IP to parent
              stopScanner(); // Stop after success
            }
          },
          (err) => console.warn('Scan error:', err)
        );
      } else {
        console.error('No camera found');
      }
    } catch (error) {
      console.error('Camera error:', error);
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
    <div className="text-center">
      {!isScanning ? (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start QR Scan
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="text-sm text-red-600 mt-2 underline"
        >
          Stop Scanner
        </button>
      )}
      <div id="reader" className={`min-h-[300px] ${isScanning ? 'block' : 'hidden'}`} />
    </div>
  );
};
