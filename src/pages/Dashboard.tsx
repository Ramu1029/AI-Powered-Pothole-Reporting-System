import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CitizenDashboard from './citizen/CitizenDashboard';
import StaffDashboard from './staff/StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';
import StaffVerification from './staff/StaffVerification';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Municipal staff: first wait for admin approval, then verify identity
  if (user.role === 'municipal_staff') {
    // First check admin approval
    if (!user.isApproved) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Account Pending Approval</h2>
            <p className="text-muted-foreground">Your account is awaiting administrator approval. You'll be able to access the dashboard once approved.</p>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      );
    }
    // Then check identity verification (phone, state, district, mandal)
    if (!user.isVerified) {
      return <StaffVerification />;
    }
    return <StaffDashboard />;
  }

  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
