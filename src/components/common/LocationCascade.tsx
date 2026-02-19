import { useIndiaLocations } from '@/hooks/useIndiaLocations';
import { Label } from '@/components/ui/label';
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
  stateCode: string | null;
  districtCode: string | null;
  onStateChange: (name: string, code: string) => void;
  onDistrictChange: (name: string, code: string) => void;
  onMandalChange: (name: string) => void;
  errors?: Record<string, string>;
}

export function LocationCascade({
  state,
  district,
  mandal,
  stateCode,
  districtCode,
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
      onStateChange(selected.name, selected.code);
      fetchDistricts(selected.code);
    }
  };

  const handleDistrictSelect = (value: string) => {
    const selected = districts.find(d => d.name === value);
    if (selected) {
      onDistrictChange(selected.name, selected.code);
      fetchMandals(selected.code);
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
              <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
      </div>

      <div className="space-y-2">
        <Label>District *</Label>
        <Select value={district} onValueChange={handleDistrictSelect} disabled={!stateCode}>
          <SelectTrigger>
            <SelectValue placeholder={
              !stateCode ? 'Select state first' :
              loadingDistricts ? 'Loading districts...' : 'Select district'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map(d => (
              <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
      </div>

      <div className="space-y-2">
        <Label>Mandal / Taluka *</Label>
        <Select value={mandal} onValueChange={handleMandalSelect} disabled={!districtCode}>
          <SelectTrigger>
            <SelectValue placeholder={
              !districtCode ? 'Select district first' :
              loadingMandals ? 'Loading mandals...' : 'Select mandal'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {mandals.map(m => (
              <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.mandal && <p className="text-xs text-destructive">{errors.mandal}</p>}
      </div>
    </div>
  );
}
