import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Glass from './Glass';
import LoadPage from './LoadPage';
import Posenet from './Posenet';
import PoseDetectionApp from './PoseDetectionApp';
import BodyDetection from './BodyDetection';
import WelcomePage from './WelcomePage'; // Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/load" element={<LoadPage />} />
        <Route path="/posenet" element={<Glass />} />
        <Route path="/pose-detection" element={<PoseDetectionApp />} />
        <Route path="/body-detection" element={<BodyDetection />} />
      </Routes>
    </Router>
  );
}

export default App;