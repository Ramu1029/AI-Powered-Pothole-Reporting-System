import { useIndiaLocations } from '@/hooks/useIndiaLocations';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationCascadeProps {
  state: string;
  district: string;
  mandal: string;
  stateId: number | null;
  districtId: number | null;
  onStateChange: (name: string, id: number) => void;
  onDistrictChange: (name: string, id: number) => void;
  onMandalChange: (name: string) => void;
  errors?: Record<string, string>;
}

export function LocationCascade({
  state,
  district,
  mandal,
  stateId,
  districtId,
  onStateChange,
  onDistrictChange,
  onMandalChange,
  errors = {},
}: LocationCascadeProps) {
  const {
    states,
    districts,
    mandals,
    loadingStates,
    loadingDistricts,
    loadingMandals,
    fetchDistricts,
    fetchMandals,
  } = useIndiaLocations();

  const handleStateSelect = (value: string) => {
    const selected = states.find(s => s.name === value);
    if (selected) {
      onStateChange(selected.name, selected.id);
      fetchDistricts(selected.id);
    }
  };

  const handleDistrictSelect = (value: string) => {
    const selected = districts.find(d => d.name === value);
    if (selected) {
      onDistrictChange(selected.name, selected.id);
      fetchMandals(selected.id);
    }
  };

  const handleMandalSelect = (value: string) => {
    onMandalChange(value);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>State *</Label>
        <Select value={state} onValueChange={handleStateSelect}>
          <SelectTrigger>
            <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select state'} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {states.map(s => (
              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
      </div>

      <div className="space-y-2">
        <Label>District *</Label>
        <Select value={district} onValueChange={handleDistrictSelect} disabled={!stateId}>
          <SelectTrigger>
            <SelectValue placeholder={
              !stateId ? 'Select state first' :
              loadingDistricts ? 'Loading districts...' : 'Select district'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map(d => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
      </div>

      <div className="space-y-2">
        <Label>Mandal / Taluka *</Label>
        <Select value={mandal} onValueChange={handleMandalSelect} disabled={!districtId}>
          <SelectTrigger>
            <SelectValue placeholder={
              !districtId ? 'Select district first' :
              loadingMandals ? 'Loading mandals...' : 'Select mandal'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {mandals.map(m => (
              <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.mandal && <p className="text-xs text-destructive">{errors.mandal}</p>}
      </div>
    </div>
  );
}
