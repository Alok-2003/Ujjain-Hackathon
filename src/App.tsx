import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExploreMap from './pages/ExploreMap';
import AllHotels from './pages/AllHotels';
import ShuttleLocation from './pages/ShuttleLocation';
import MandirList from './pages/MandirList';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<ExploreMap />} />
            <Route path="/hotels" element={<AllHotels />} />
            <Route path="/shuttle" element={<ShuttleLocation />} />
            <Route path="/temples" element={<MandirList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;