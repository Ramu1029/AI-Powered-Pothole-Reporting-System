import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationCascade } from '@/components/common/LocationCascade';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mandatory?: boolean;
}

export function ProfileFormModal({ open, onOpenChange, mandatory = false }: ProfileFormModalProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    phone: '',
    state: '',
    district: '',
    mandal: '',
    stateId: null as number | null,
    districtId: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setProfileData({
        phone: user.phone || '',
        state: user.state || '',
        district: user.district || '',
        mandal: user.mandal || '',
        stateId: null,
        districtId: null,
      });
      setErrors({});
    }
  }, [open, user]);

  const isComplete = !!(user?.phone && user?.state && user?.district && user?.mandal);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profileData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(profileData.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!profileData.state) e.state = 'State is required';
    if (!profileData.district) e.district = 'District is required';
    if (!profileData.mandal) e.mandal = 'Mandal is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        phone: profileData.phone.trim(),
        state: profileData.state,
        district: profileData.district,
        mandal: profileData.mandal,
        region: `${profileData.mandal}, ${profileData.district}`,
        is_verified: true,
      } as any)
      .eq('user_id', user.id);

    setSaving(false);
    if (!error) {
      window.location.reload();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && mandatory && !isComplete) return;
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => { if (mandatory && !isComplete) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (mandatory && !isComplete) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>{mandatory && !isComplete ? 'Complete Your Profile' : 'Edit Profile'}</DialogTitle>
        </DialogHeader>

        {mandatory && !isComplete && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              You must complete your profile details before continuing. Please fill in all required fields.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone Number *</Label>
            <Input
              id="profile-phone"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <LocationCascade
            state={profileData.state}
            district={profileData.district}
            mandal={profileData.mandal}
            stateId={profileData.stateId}
            onStateChange={(name, id) => setProfileData(prev => ({ ...prev, state: name, stateId: id, district: '', districtId: null, mandal: '' }))}
            onDistrictChange={(name, id) => setProfileData(prev => ({ ...prev, district: name, districtId: id, mandal: '' }))}
            onMandalChange={(name) => setProfileData(prev => ({ ...prev, mandal: name }))}
            errors={errors}
          />

          <Button onClick={handleSave} className="w-full" variant="accent" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isComplete ? 'Update Profile' : 'Save & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
