import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import LecturerExplorePage from './pages/LecturerExplorePage';
import ArticleListingPage from './pages/ArticleListingPage';
import ResearchListingPage from './pages/ResearchListingPage';
import CommunityServicePage from './pages/CommunityServicePage';
import UserManagementPage from './pages/UserManagementPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute allowedRoles={['Lecturer', 'Admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/explore/:lecturerId" element={<LecturerExplorePage />} />
              <Route path="/articles/:source" element={<ArticleListingPage />} />
              <Route path="/researches" element={<ResearchListingPage />} />
              <Route path="/service" element={<CommunityServicePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
