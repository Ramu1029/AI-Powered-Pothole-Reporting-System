import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/common/FormMessage';
import { LocationCascade } from '@/components/common/LocationCascade';
import { LogOut, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function StaffVerification() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    state: '',
    district: '',
    mandal: '',
    stateId: null as number | null,
    districtId: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.mandal) newErrors.mandal = 'Mandal is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setSubmitting(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: formData.phone.trim(),
        state: formData.state,
        district: formData.district,
        mandal: formData.mandal,
        region: `${formData.mandal}, ${formData.district}`,
        is_verified: true,
      } as any)
      .eq('user_id', user.id);

    if (updateError) {
      setError('Failed to verify identity. Please try again.');
      setSubmitting(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Verify Your Identity</h2>
          <p className="text-muted-foreground">
            Please provide your contact details to verify your identity as municipal staff.
          </p>
        </div>

        {error && <FormMessage type="error" message={error} />}

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <LocationCascade
            state={formData.state}
            district={formData.district}
            mandal={formData.mandal}
            stateId={formData.stateId}
            onStateChange={(name, id) => setFormData(prev => ({ ...prev, state: name, stateId: id, district: '', districtId: null, mandal: '' }))}
            onDistrictChange={(name, id) => setFormData(prev => ({ ...prev, district: name, districtId: id, mandal: '' }))}
            onMandalChange={(name) => setFormData(prev => ({ ...prev, mandal: name }))}
            errors={errors}
          />

          <Button onClick={handleSubmit} className="w-full" variant="accent" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Verify & Continue
          </Button>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={handleLogout} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
