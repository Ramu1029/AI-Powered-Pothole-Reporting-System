import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CitizenDashboard from './citizen/CitizenDashboard';
import StaffDashboard from './staff/StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'municipal_staff':
      return <StaffDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
