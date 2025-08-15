// src/App.jsx
import { useState } from 'react';
import QRCode from 'react-qr-code';
import './index.css';

function App() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQRCode = async () => {
    setQrCodeUrl('');
    setError(null);
    setLoading(true);

    try {
      // This app's sole purpose is to generate a QR code.
      // It makes a POST request to the API to get the final URL.
      const response = await fetch('https://api.molyneaux.xyz/qr_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upload_url: `https://vehicledamage.molyneaux.xyz/?vehicle=${vehicleNumber}` }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQrCodeUrl(data.upload_url);
    } catch (e) {
      console.error('Failed to fetch QR code URL:', e);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Vehicle Photo Uploader
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter a vehicle number to generate a QR code for photo uploads.
        </p>

        <div className="mb-4">
          <label htmlFor="vehicleNumber" className="block text-gray-700 font-semibold mb-2">
            Vehicle Number
          </label>
          <input
            id="vehicleNumber"
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="e.g., 12345"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          />
        </div>

        <button
          onClick={generateQRCode}
          disabled={!vehicleNumber || loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>

        {error && (
          <p className="mt-4 text-center text-red-500 font-medium">
            {error}
          </p>
        )}

        {qrCodeUrl && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <p className="text-gray-700 font-semibold text-center">
              Scan this QR code to upload photos:
            </p>
            <div className="p-2 bg-white rounded-md shadow-md">
              <QRCode value={qrCodeUrl} />
            </div>
            <a
              href={qrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline break-words text-center"
            >
              {qrCodeUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
