import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Glass from './Glass';
import LoadPage from './LoadPage';
import Posenet from './Posenet';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Posenet />} />
          <Route path="/load" element={<LoadPage />} />
          <Route path="/posenet" element={<Glass />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;