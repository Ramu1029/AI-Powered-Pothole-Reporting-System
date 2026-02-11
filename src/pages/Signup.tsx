import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormMessage } from '@/components/common/FormMessage';
import { Shield, User, Wrench } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Full name is required'); return; }
    if (!email.trim()) { setError('Email address is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    const result = await signup(email, password, name, role);
    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created successfully. Please check your email to verify your account before signing in.');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const roleIcons = { citizen: User, municipal_staff: Wrench, admin: Shield };
  const RoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">RoadWatch</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-primary-foreground leading-tight">
            Join the Community
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Create your account to start reporting road hazards and help improve infrastructure in your area.
          </p>
        </div>
        <div className="text-primary-foreground/50 text-sm">
          © 2024 RoadWatch. Municipal Infrastructure Division.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">RoadWatch</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-foreground">Create an account</h2>
            <p className="mt-2 text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} />}

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label>Account type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Citizen</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="municipal_staff">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Municipal Staff</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {role === 'municipal_staff' && (
                <p className="text-xs text-muted-foreground">Municipal staff accounts require admin approval before access is granted.</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
