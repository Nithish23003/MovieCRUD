import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieCRUD from './components/MovieCRUD';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MovieCRUD />} />
      </Routes>
    </Router>
  );
}

export default App;
