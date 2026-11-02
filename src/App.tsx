import SealedEntry from './components/SealedEntry';
import HeroSection from './components/HeroSection';
import MemoriesSection from './components/MemoriesSection';
import NineteenPortal from './components/NineteenPortal';
import HappyBirthday from './components/HappyBirthday';
import Reasons from './components/Reasons';
import CandleWish from './components/CandleWish';
import MusicPlayer from './components/MusicPlayer';
import Playground from './components/Playground';
import MessageSection from './components/MessageSection';
import GiftBoxes from './components/GiftBoxes';
import Guestbook from './components/Guestbook';
import ConstellationFinale from './components/ConstellationFinale';
import Footer from './components/Footer';
import AmbientBackground from './components/magic/AmbientBackground';
import ScrollProgressBar from './components/ScrollProgressBar';
import DecorativeShapes from './components/DecorativeShapes';
import { useCustomCursor } from './hooks/useCustomCursor';
import './App.css';

function App() {
  useCustomCursor();

  return (
    <div className="app">
      <ScrollProgressBar />
      <AmbientBackground intensity="low" />
      <DecorativeShapes />

      <SealedEntry />
      <HeroSection />
      <NineteenPortal />
      <HappyBirthday />
      <Reasons />
      <MemoriesSection />
      <CandleWish />
      <MusicPlayer />
      <Playground />
      <MessageSection />
      <GiftBoxes />
      <Guestbook />
      <ConstellationFinale />
      <Footer />
    </div>
  );
}

export default App;
