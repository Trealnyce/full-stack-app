import React, { useState, useEffect } from 'react';

const App = () => {
  const [message, setMessage] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // We are using 'fastapi_backend' as the hostname because that's the
    // service name we'll define in our docker-compose.yml file.
    fetch('http://fastapi_backend:8000')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setMessage(data.message);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setError('Failed to fetch data from the backend.');
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <h1 className="text-3xl font-bold mb-4 text-purple-700">Full-Stack Docker App</h1>
        <p className="text-xl font-medium">{error ? `Error: ${error}` : message}</p>
      </div>
    </div>
  );
};

export default App;