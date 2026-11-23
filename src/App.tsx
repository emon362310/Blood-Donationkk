import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PublicLayout } from './components/layout/PublicLayout';
import { BloodDropLoader } from './components/ui/MotionPrimitives';

import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { FindDonorsPage } from './pages/public/FindDonorsPage';
import { DonorDetailsPage } from './pages/public/DonorDetailsPage';
import { BloodRequestPage } from './pages/public/BloodRequestPage';
import { BloodRequestListPage, EmergencyRequestsPage } from './pages/public/RequestsAndEmergencyPages';
import { CampaignsPage, CampaignDetailsPage } from './pages/public/CampaignPages';
import { BlogsPage, BlogDetailsPage } from './pages/public/BlogPages';
import { CompatibilityPage } from './pages/public/CompatibilityPage';
import {
  AboutPage,
  FaqPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
  NotFoundPage
} from './pages/public/StaticPublicPages';

import { DonorDashboard } from './pages/dashboard/DonorDashboard';
import { RecipientDashboard } from './pages/dashboard/RecipientDashboard';
import { VolunteerDashboard } from './pages/dashboard/VolunteerDashboard';
import { RepresentativeDashboard } from './pages/dashboard/RepresentativeDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';

const ProtectedRoute: React.FC<{ roles?: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, loading, dashboardPathForRole } = useAuth();
  if (loading) return <BloodDropLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<BloodDropLoader />}>
            <Routes>
              {/* All 20 Public Pages */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/donors" element={<PublicLayout><FindDonorsPage /></PublicLayout>} />
              <Route path="/donors/:id" element={<PublicLayout><DonorDetailsPage /></PublicLayout>} />
              <Route path="/request-blood" element={<PublicLayout><BloodRequestPage /></PublicLayout>} />
              <Route path="/emergency" element={<PublicLayout><EmergencyRequestsPage /></PublicLayout>} />
              <Route path="/requests" element={<PublicLayout><BloodRequestListPage /></PublicLayout>} />
              <Route path="/campaigns" element={<PublicLayout><CampaignsPage /></PublicLayout>} />
              <Route path="/campaigns/:id" element={<PublicLayout><CampaignDetailsPage /></PublicLayout>} />
              <Route path="/blog" element={<PublicLayout><BlogsPage /></PublicLayout>} />
              <Route path="/blog/:slug" element={<PublicLayout><BlogDetailsPage /></PublicLayout>} />
              <Route path="/compatibility" element={<PublicLayout><CompatibilityPage /></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><FaqPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

              {/* All 6 Role Dashboards */}
              <Route
                path="/dashboard/donor"
                element={
                  <ProtectedRoute roles={['donor', 'user']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/recipient"
                element={
                  <ProtectedRoute roles={['recipient']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/volunteer"
                element={
                  <ProtectedRoute roles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/representative"
                element={
                  <ProtectedRoute roles={['representative']}>
                    <RepresentativeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute roles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/super-admin"
                element={
                  <ProtectedRoute roles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/super-admin" element={<Navigate to="/dashboard/super-admin" replace />} />

              {/* 404 */}
              <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
