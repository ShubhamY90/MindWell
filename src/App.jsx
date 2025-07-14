import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Test from '../pages/Test'; 
import { Header } from '../components/Header/Header';
import Auth from '../pages/Auth'; 
import Community from '../pages/Community';  
import Resources from '../pages/Resources'; 
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path='/auth' element={<Auth/>} />
            <Route path='/community' element={<Community/>} />
            <Route path="/resources" element={<Resources/>} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default App;