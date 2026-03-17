import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, Wrench, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileFormModal } from '@/components/common/ProfileFormModal';

const roleIcons = {
  citizen: User,
  municipal_staff: Wrench,
  admin: Shield,
};

const roleLabels = {
  citizen: 'Citizen',
  municipal_staff: 'Municipal Staff',
  admin: 'Administrator',
};

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const RoleIcon = roleIcons[user.role];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showProfileButton = user.role === 'citizen' || user.role === 'municipal_staff';

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">RoadWatch</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RoleIcon className="h-4 w-4" />
              <span>{roleLabels[user.role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {showProfileButton && (
              <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)} title="My Profile">
                <UserCircle className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {showProfileButton && (
        <ProfileFormModal
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      )}
    </>
  );
}
