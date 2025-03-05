console.log('App component rendered');import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ScoreCardApp from './components/ScoreCardApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app/*" element={<ScoreCardApp />} />
    </Routes>
  );
}

export default App;