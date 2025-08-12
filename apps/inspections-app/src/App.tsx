import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginScreen } from '@/components/LoginScreen';
import { WorkOrdersPage } from '@/routes/WorkOrdersPage';
import { WorkOrderDetailPage } from '@/routes/WorkOrderDetailPage';
import { InspectionPage } from '@/routes/InspectionPage';
import { ResultsPage } from '@/routes/ResultsPage';
import { useAuth } from '@/hooks/useAuth';
import { ProfilePage } from '@/components/ProfilePage';
import { MobileShell } from '@/components/MobileShell';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginScreenWrapper />} />

        <Route element={<ProtectedRoute />}> 
          <Route element={<MobileShell />}> 
            <Route index element={<Navigate to="/work-orders" replace />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetailPage />} />
            <Route path="/work-orders/:workOrderId/inspections/:inspectionId" element={<InspectionPage />} />
            <Route path="/results/:inspectionId" element={<ResultsPage />} />
            <Route path="/profile" element={<ProfilePageWrapper />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/work-orders" replace />} />
      </Routes>
    </AuthProvider>
  );
}

function LoginScreenWrapper() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (phoneNumber: string) => {
    login(phoneNumber);
    const redirectTo = (location.state as any)?.from?.pathname || '/work-orders';
    navigate(redirectTo, { replace: true });
  };

  return <LoginScreen onLogin={handleLogin} />;
}

function ProfilePageWrapper() {
  const navigate = useNavigate();
  return <ProfilePage onBack={() => navigate('/work-orders')} />;
}

export default App;