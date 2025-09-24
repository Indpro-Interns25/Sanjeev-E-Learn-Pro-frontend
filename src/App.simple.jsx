import 'bootstrap/dist/css/bootstrap.min.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import Home from './routes/Public/Home';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UiProvider>
          <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">
              <Home />
            </main>
          </div>
        </UiProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}