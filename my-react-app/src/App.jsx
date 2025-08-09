import { useState } from 'react';
import './index.css';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, world!
        </h1>
        <p className="mt-4 text-gray-600">
          Your React application is now building successfully.
        </p>
      </div>
    </div>
  );
}

export default App;