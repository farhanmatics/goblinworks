import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Glass from './Glass';
import LoadPage from './LoadPage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Glass />} />
          <Route path="/load" element={<LoadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;