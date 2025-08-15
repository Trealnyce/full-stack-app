// src/App.jsx
import { useState, useEffect } from 'react';
import './index.css';

const PhotoUploader = ({ vehicleNumber }) => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile && files.length < 4) {
      setFiles(prevFiles => [...prevFiles, newFile]);
      setPreviewUrls(prevUrls => [...prevUrls, URL.createObjectURL(newFile)]);
      setMessage('');
    } else if (files.length >= 4) {
      setMessage('You can only upload a maximum of 4 photos.');
    }
  };

  const handleUpload = async () => {
    if (files.length !== 4) {
      setMessage('Please select exactly 4 photos to upload.');
      return;
    }

    setLoading(true);
    setMessage('Uploading photos...');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`https://api.molyneaux.xyz/upload_photos?vehicle_number=${vehicleNumber}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload success:', data);
      setMessage(data.message);

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
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  // This useEffect will parse the URL for the vehicle number
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicle = urlParams.get('vehicle');
    if (vehicle) {
      setVehicleNumber(vehicle);
    }
  }, []);

  // Only render the PhotoUploader if a vehicle number is present
  if (vehicleNumber) {
    return <PhotoUploader vehicleNumber={vehicleNumber} />;
  }

  // Otherwise, display a message that this page requires a vehicle number
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Vehicle Photo Uploader
        </h1>
        <p className="text-gray-600">
          This page is for uploading photos. Please use the QR code generator at <a href="https://qrcode.molyneaux.xyz" className="text-indigo-600 underline">qrcode.molyneaux.xyz</a> to get started.
        </p>
      </div>
    </div>
  );
}

export default App;
