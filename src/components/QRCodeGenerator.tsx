import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Wifi, Pencil } from 'lucide-react';
import QRCode from 'qrcode';

export function QRCodeGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [ipAddress, setIpAddress] = useState(() => localStorage.getItem('scanned_ip') || '192.168.0.199');
  const [isEditing, setIsEditing] = useState(false);
  const [tempIp, setTempIp] = useState(ipAddress);

const deviceUrl = React.useMemo(() => `http://${ipAddress}:3000`, [ipAddress]);

 

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(deviceUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#FFFFFF',
            light: '#00000000',
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    generateQRCode();
  }, [deviceUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deviceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const saveIp = () => {
    localStorage.setItem('scanned_ip', tempIp);
    setIpAddress(tempIp);
    setIsEditing(false);
  };

  const resetIp = () => {
    localStorage.removeItem('scanned_ip');
    setIpAddress('192.168.1.100');
    setTempIp('192.168.1.100');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-green-400" />
          Device Access
        </h3>
      </div>

      {/* QR Code Display */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white rounded-xl">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Device QR Code"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />
          )}
        </div>
        <p className="text-sm text-gray-400 mt-3">
          Scan to access dashboard from any device
        </p>
      </div>

      {/* Device Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">IP Address</p>
              <p className="text-xs text-gray-400">Local Network</p>
            </div>
          </div>
          {isEditing ? (
            <input
              value={tempIp}
              onChange={(e) => setTempIp(e.target.value)}
              className="bg-gray-700 text-white text-sm px-2 py-1 rounded outline-none w-32"
            />
          ) : (
            <span className="text-green-400 font-mono">{ipAddress}</span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">Dashboard URL</p>
            <p className="text-xs text-gray-400 font-mono">{deviceUrl}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Edit and Reset Controls */}
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={saveIp}
                className="text-xs text-green-400 hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:underline"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-xs text-blue-400 hover:underline"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit IP
              </button>
              <button
                onClick={resetIp}
                className="text-xs text-red-400 hover:underline"
              >
                Reset IP
              </button>
            </>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">Quick Access</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Scan QR code with phone camera</li>
          <li>• Share URL with authorized users</li>
          <li>• Bookmark for quick access</li>
        </ul>
      </div>
    </div>
  );
}
