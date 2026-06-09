import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { PageTransition } from './components/PageTransition';
import { CampusProvider } from './context/CampusContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { About } from './pages/About';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { PrayerGuide } from './pages/PrayerGuide';

function App() {
  return (
    <LanguageProvider>
      <CampusProvider>
        <div className="app">
          <Header />
          <PageTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/pray" element={<PrayerGuide />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </PageTransition>
        </div>
      </CampusProvider>
    </LanguageProvider>
  );
}

export default App;
