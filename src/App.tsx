import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { InputProvider } from './context/InputContext';
import { SessionProvider } from './context/SessionContext';
import Directory from './pages/Directory';
import GameHost from './pages/GameHost';

function App() {
  return (
    <InputProvider>
      <Router>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<Directory />} />
            <Route path="/host/:gameId" element={<GameHost />} />
          </Routes>
        </SessionProvider>
      </Router>
    </InputProvider>
  );
}

export default App;