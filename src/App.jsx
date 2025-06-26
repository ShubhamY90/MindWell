import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Questionnaire from '../pages/Questionnaire';
import Home from '../pages/Home';
import { Header } from '../components/Header/Header';
import Community from '../pages/Community';
import LoginPage from '../pages/Login';

export default function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Add other public routes */}
        </Routes>  
      </main>
    </Router>
  );
}