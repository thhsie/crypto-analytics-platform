import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* Public Only (Redirects to Dashboard if logged in) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;