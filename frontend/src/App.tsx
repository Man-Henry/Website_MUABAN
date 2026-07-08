import AppRouter from './routes/AppRouter';
import GlobalSocketBanner from './components/GlobalSocketBanner';

function App() {
  return (
    <>
      <GlobalSocketBanner />
      <AppRouter />
    </>
  );
}

export default App;
