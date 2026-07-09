import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AppRouter from './routes/AppRouter';
import GlobalSocketBanner from './components/GlobalSocketBanner';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <>
      <GlobalSocketBanner />
      <AppRouter />
    </>
  );
}

export default App;
