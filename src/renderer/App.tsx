import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MainApp from './components/MainApp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
