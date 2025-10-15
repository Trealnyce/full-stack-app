import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
    // State to manage user authentication
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // State for viewing vehicle photos
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [view, setView] = useState('login'); // 'login' or 'viewer'

    // API URL. We use localhost since it's on the same Docker network as the frontend.
    const API_URL = "http://fastapi-backend:8000";

    // Check for a token in local storage on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
            setView('viewer');
        } else {
            setView('login');
        }
    }, []);

    // Function to handle user login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=password&username=${username}&password=${password}`,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setLoginError(errorData.detail || 'Login failed.');
                return;
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            setIsLoggedIn(true);
            setView('viewer');
            fetchVehicles(data.access_token);
        } catch (error) {
            setLoginError('An error occurred. Please try again later.');
            console.error('Login error:', error);
        }
    };

    // Function to handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsLoggedIn(false);
        setUser(null);
        setVehicles([]);
        setSelectedVehicle(null);
        setView('login');
    };

    // Function to fetch the list of vehicles
    const fetchVehicles = async (authToken) => {
        try {
            const response = await fetch(`${API_URL}/vehicles`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch vehicles');
            }

            const data = await response.json();
            setVehicles(data);
        } catch (error) {
            console.error('Fetch vehicles error:', error);
            setVehicles([]);
        }
    };

    // Use effect to fetch vehicles when a token is available
    useEffect(() => {
        if (token) {
            fetchVehicles(token);
        }
    }, [token]);

    // Function to render the login form
    const renderLogin = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Log In</h1>
            {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                    Log In
                </button>
            </form>
        </div>
    );

    // Function to render the vehicle viewer
    const renderViewer = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Vehicle Photos</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Log Out
                </button>
            </div>
            {!selectedVehicle && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Select a Vehicle</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {vehicles.map((vehicle) => (
                            <li
                                key={vehicle.id}
                                className="bg-gray-100 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-indigo-100 transition duration-300"
                                onClick={() => setSelectedVehicle(vehicle)}
                            >
                                <p className="font-semibold text-lg text-gray-800">{vehicle.vehicle_id}</p>
                                <p className="text-sm text-gray-500">Photos: {vehicle.num_photos}</p>
                                <p className="text-xs text-gray-400">Created: {new Date(vehicle.created_at).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {selectedVehicle && (
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSelectedVehicle(null)}
                            className="text-indigo-600 hover:text-indigo-800 transition duration-300 font-bold"
                        >
                            &larr; Back to Vehicles
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">Photos for {selectedVehicle.vehicle_id}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedVehicle.photos.map((photo, index) => (
                            <div key={index} className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
                                <img
                                    src={`${API_URL}/photos/${selectedVehicle.vehicle_id}/${photo.filename}`}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <div className="p-4 text-sm text-gray-600 space-y-1">
                                    <p><strong>Date:</strong> {new Date(photo.date_taken).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {new Date(photo.date_taken).toLocaleTimeString()}</p>
                                    <p><strong>Latitude:</strong> {photo.latitude || 'N/A'}</p>
                                    <p><strong>Longitude:</strong> {photo.longitude || 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="App flex items-center justify-center min-h-screen">
            {isLoggedIn ? renderViewer() : renderLogin()}
        </div>
    );
};

export default App;
