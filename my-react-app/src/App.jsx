// src/App.jsx
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import './index.css';

// A new component to handle the photo upload page
const PhotoUploader = ({ vehicleNumber }) => {
  // Use state to hold an array of files and their preview URLs
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for when a file is selected
  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile && files.length < 4) {
      setFiles(prevFiles => [...prevFiles, newFile]);
      setPreviewUrls(prevUrls => [...prevUrls, URL.createObjectURL(newFile)]);
      setMessage(''); // Clear any previous messages
    } else if (files.length >= 4) {
      setMessage('You can only upload a maximum of 4 photos.');
    }
  };

  // Handler for the upload button - this is the final, working logic
  const handleUpload = async () => {
    if (files.length !== 4) {
      setMessage('Please select exactly 4 photos to upload.');
      return;
    }

    setLoading(true);
    setMessage('Uploading photos...');

    try {
      // Create a FormData object to send all files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file); // Note: we are now appending with 'files'
      });
      
      // Use the correct API URL and pass the vehicle number
      const response = await fetch(`https://vehicledamage.molyneaux.xyz/upload_photos?vehicle_number=${vehicleNumber}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload success:', data);
      setMessage(data.message); // Display the success message from the backend

      // Clear the files and previews after a successful upload
      setFiles([]);
      setPreviewUrls([]);
    } catch (e) {
      console.error('Upload failed:', e);
      setMessage(`Failed to upload photos. Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Upload Photos for Vehicle: {vehicleNumber}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Select up to 4 photos to upload.
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-700 font-semibold mb-2"
            disabled={files.length >= 4}
          />
          
          <div className="grid grid-cols-2 gap-4 w-full">
            {previewUrls.map((url, index) => (
              <div key={index} className="w-full overflow-hidden rounded-lg shadow-md">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={files.length !== 4 || loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : `Upload (${files.length} / 4)`}
          </button>
        </div>
        
        {message && (
          <p className={`mt-4 text-center font-medium ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};


function App() {
  // Use state to track the current view (qr_generator or photo_uploader)
  const [currentPage, setCurrentPage] = useState('qr_generator');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check the URL for a vehicle number to determine the page to show
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicle = urlParams.get('vehicle');
    if (vehicle) {
      setVehicleNumber(vehicle);
      setCurrentPage('photo_uploader');
    }
  }, []);

  const generateQRCode = async () => {
    setQrCodeUrl('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('https://qrcode.molyneaux.xyz/qr_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The QR code now points to the new domain
        body: JSON.stringify({ upload_url: `https://vehicledamage.molyneaux.xyz/?vehicle=${vehicleNumber}` }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      setQrCodeUrl(data.upload_url);
    } catch (e) {
      console.error('Failed to fetch QR code URL:', e);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render the appropriate component based on the current page state
  if (currentPage === 'photo_uploader') {
    return <PhotoUploader vehicleNumber={vehicleNumber} />;
  }

  // Default view: QR code generator
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