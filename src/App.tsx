import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchSortProvider } from './context/SearchSortContext';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import TableView from './pages/TableView';
import CouncilorDetail from './pages/CouncilorDetail';
import Posters from './pages/Posters';
import Election2026 from './pages/Election2026';
import './index.css';

function App() {
  return (
    <SearchSortProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Election2026 />} />
          <Route path="/cards" element={<Home />} />
          <Route path="/table" element={<TableView />} />
          <Route path="/posters" element={<Posters />} />
          <Route path="/election" element={<Election2026 />} />
          <Route path="/councilor/:name" element={<CouncilorDetail />} />
        </Routes>
        <BottomNav />
      </Router>
    </SearchSortProvider>
  );
}

export default App;
