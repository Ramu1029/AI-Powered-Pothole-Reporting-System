import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/common/FormMessage';
import { loginCredentials } from '@/data/mockData';
import { Shield, User, Wrench, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleQuickLogin = (role: keyof typeof loginCredentials) => {
    const creds = loginCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
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
            Citizen-Centric Road<br />Hazard Reporting
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            A comprehensive platform for reporting, tracking, and resolving road infrastructure issues efficiently.
          </p>
        </div>

        <div className="text-primary-foreground/50 text-sm">
          © 2024 RoadWatch. Municipal Infrastructure Division.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">RoadWatch</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-foreground">Sign in to your account</h2>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <FormMessage type="error" message={error} />}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Demo credentials — click to autofill
            </p>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('citizen')}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Citizen</p>
                  <p className="text-xs text-muted-foreground">{loginCredentials.citizen.email}</p>
                </div>
                <KeyRound className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('municipal_staff')}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Municipal Staff</p>
                  <p className="text-xs text-muted-foreground">{loginCredentials.municipal_staff.email}</p>
                </div>
                <KeyRound className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Administrator</p>
                  <p className="text-xs text-muted-foreground">{loginCredentials.admin.email}</p>
                </div>
                <KeyRound className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
