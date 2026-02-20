import { useIndiaLocations } from '@/hooks/useIndiaLocations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  onStateChange,
  onDistrictChange,
  onMandalChange,
  errors = {},
}: LocationCascadeProps) {
  const {
    states,
    districts,
    loadingStates,
    loadingDistricts,
    fetchDistricts,
  } = useIndiaLocations();

  const handleStateSelect = (value: string) => {
    const id = Number(value);
    const selected = states.find(s => s.state_id === id);
    if (selected) {
      onStateChange(selected.state_name, selected.state_id);
      fetchDistricts(selected.state_id);
    }
  };

  const handleDistrictSelect = (value: string) => {
    const id = Number(value);
    const selected = districts.find(d => d.district_id === id);
    if (selected) {
      onDistrictChange(selected.district_name, selected.district_id);
    }
  };

  return (
    <div className="space-y-3">
      {/* State */}
      <div className="space-y-2">
        <Label>State *</Label>
        <Select
          value={stateId !== null ? String(stateId) : ''}
          onValueChange={handleStateSelect}
          disabled={loadingStates}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select state'} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {states.map(s => (
              <SelectItem key={s.state_id} value={String(s.state_id)}>
                {s.state_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
      </div>

      {/* District */}
      <div className="space-y-2">
        <Label>District *</Label>
        <Select
          value={district ? String(districts.find(d => d.district_name === district)?.district_id ?? '') : ''}
          onValueChange={handleDistrictSelect}
          disabled={stateId === null || loadingDistricts}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              stateId === null ? 'Select state first' :
              loadingDistricts ? 'Loading districts...' : 'Select district'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map(d => (
              <SelectItem key={d.district_id} value={String(d.district_id)}>
                {d.district_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
      </div>

      {/* Mandal – free text since no free mandal API */}
      <div className="space-y-2">
        <Label>Mandal / Taluka</Label>
        <Input
          value={mandal}
          onChange={e => onMandalChange(e.target.value)}
          placeholder="Enter mandal or taluka name"
          disabled={!district}
        />
        {errors.mandal && <p className="text-xs text-destructive">{errors.mandal}</p>}
      </div>
    </div>
  );
}
