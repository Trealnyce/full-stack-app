import { useState, useEffect } from 'react';

// Main App component
export default function App() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [photos, setPhotos] = useState([]);

  // Check the URL for the vehicle number when the component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vin = urlParams.get('vehicle');
    if (vin) {
      setVehicleNumber(vin);
    }
  }, []);

  // An inline SVG icon for the image upload
  const ImagePlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-indigo-600 dark:text-indigo-400 mb-4">
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
      <path d="M16 18H6a2 2 0 0 1-2-2V7.5L7 4"></path>
      <path d="M18 10a2 2 0 0 0-2-2h-5"></path>
      <path d="M12 18H5a2 2 0 0 1-2-2v-7.5L7 4a2 2 0 0 1 2-2h3.5L18 7.5V10"></path>
      <circle cx="12" cy="12" r="3"></circle>
      <rect width="16" height="16" x="4" y="4" rx="2"></rect>
      <circle cx="9" cy="9" r="2"></circle>
    </svg>
  );

  // An inline SVG icon for the upload button
  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" x2="12" y1="3" y2="15"></line>
    </svg>
  );

  // Handle file selection
  const handlePhotoSelect = (event) => {
    // Only take the first 5 files if more are selected
    const files = Array.from(event.target.files).slice(0, 5);
    setPhotos(files);
  };

  // Handle the upload action
  const handleUpload = () => {
    // This is a placeholder function. In a real app,
    // you would send the 'photos' and 'vehicleNumber' to your backend API here.
    console.log('Uploading photos...');
    console.log('Vehicle Number:', vehicleNumber);
    console.log('Photos to upload:', photos);

    // You can add logic here to show a success message or clear the form
    setPhotos([]);
  };

  // Check if the upload button should be enabled
  const isUploadEnabled = photos.length === 5;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <div className="flex flex-col items-center">
          <ImagePlusIcon />
          <h1 className="text-3xl font-bold mb-2 text-center">Vehicle Damage Uploader</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Please upload photos for vehicle:
            <br />
            <span className="font-mono text-lg text-indigo-600 dark:text-indigo-400 font-bold">{vehicleNumber || 'Loading...'}</span>
          </p>
        </div>

        <div className="w-full">
          <label className="flex flex-col items-center justify-center px-4 py-8 mb-4 tracking-wide uppercase border border-dashed border-gray-400 dark:border-gray-500 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              ></path>
            </svg>
            <span className="mt-2 text-base leading-normal text-center">
              Drag & Drop or Click to Select Photos
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {`Selected: ${photos.length} / 5 photos`}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </label>
        </div>

        {/* Display selected photos as a preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!isUploadEnabled}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            isUploadEnabled
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              : 'bg-gray-400 cursor-not-allowed text-gray-600'
          }`}
        >
          <UploadIcon />
          <span>Upload 5 Photos</span>
        </button>
      </div>
    </div>
  );
}