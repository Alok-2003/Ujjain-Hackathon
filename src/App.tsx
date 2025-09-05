 import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import ExploreMap from './pages/ExploreMap';
import Travel from './pages/Travel';
import WorkerManage from './pages/WorkerManage';
import Dustbins from './pages/Dustbins';
import Toilets from './pages/Toilets';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<ExploreMap />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/workers" element={<WorkerManage />} />
              <Route path="/dustbins" element={<Dustbins />} />
              <Route path="/toilets" element={<Toilets />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;