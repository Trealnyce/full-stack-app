// src/App.jsx
import { useState } from 'react';
import './index.css';

function App() {
  // State to hold the vehicle number from the input field
  const [vehicleNumber, setVehicleNumber] = useState('');
  // State to hold the URL returned from the FastAPI backend
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  // State for loading and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the API call to the FastAPI backend
  const generateQRCode = async () => {
    // Clear previous results and set loading state
    setQrCodeUrl('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.231:3027/qr_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the vehicle number in the request body
        body: JSON.stringify({ vehicle_number: vehicleNumber }),
      });

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Update the state with the URL from the backend
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

        {/* Input field for the vehicle number */}
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

        {/* Button to trigger the API call */}
        <button
          onClick={generateQRCode}
          disabled={!vehicleNumber || loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>

        {/* Display results, loading, or error messages */}
        {error && (
          <p className="mt-4 text-center text-red-500 font-medium">
            {error}
          </p>
        )}

        {qrCodeUrl && (
          <div className="mt-6 text-center">
            <p className="text-gray-700 font-semibold mb-2">
              QR Code URL Generated!
            </p>
            <a
              href={qrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline break-words"
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