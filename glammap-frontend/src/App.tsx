import './App.css';
import { AppRouter } from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider } from './context/AuthContext';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error('❌ Falta VITE_GOOGLE_MAPS_API_KEY en el .env');
}

function App() {
  return (
    <ErrorBoundary fallback={<p>Error general de la aplicación 😵</p>}>
      <AuthProvider>  
      <APIProvider
        apiKey={googleMapsApiKey}
        version="beta" // Required for Places API (New) classes to be exposed sometimes
        solutionChannel="GMP_GCC_PUBLIC_MARKERS_0" // Esto ayuda a los marcadores avanzados
        libraries={['places', 'marker']}
        onLoad={() => console.log('Google Maps Loaded! ✅')}
        onError={(err: any) => console.error('Google Maps Error ❌', err)}
      >
        <AppRouter />
      </APIProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
