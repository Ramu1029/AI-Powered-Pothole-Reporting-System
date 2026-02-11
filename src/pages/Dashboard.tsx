import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CitizenDashboard from './citizen/CitizenDashboard';
import StaffDashboard from './staff/StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isApproved && user.role === 'municipal_staff') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Account Pending Approval</h2>
          <p className="text-muted-foreground">Your municipal staff account is awaiting administrator approval. You'll be able to access the dashboard once approved.</p>
        </div>
      </div>
    );
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
