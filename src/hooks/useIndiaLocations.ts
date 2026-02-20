import { useState, useEffect, useCallback } from 'react';

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-proxy`;

export interface StateOption {
  state_id: number;
  state_name: string;
}

export interface DistrictOption {
  district_id: number;
  district_name: string;
  state_id: number;
}

export function useIndiaLocations() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [errorStates, setErrorStates] = useState<string | null>(null);

  // Fetch all states on mount
  useEffect(() => {
    setLoadingStates(true);
    setErrorStates(null);
    fetch(`${PROXY_BASE}?type=states`)
      .then(res => res.json())
      .then(data => {
        // CoWIN response: { states: [{state_id, state_name}] }
        const arr: StateOption[] = data?.states ?? [];
        setStates(arr);
      })
      .catch(err => {
        console.error('Failed to fetch states:', err);
        setErrorStates('Failed to load states');
      })
      .finally(() => setLoadingStates(false));
  }, []);

  const fetchDistricts = useCallback(async (stateId: number) => {
    setDistricts([]);
    setLoadingDistricts(true);
    try {
      const res = await fetch(`${PROXY_BASE}?type=districts&state_id=${stateId}`);
      const data = await res.json();
      // CoWIN response: { districts: [{district_id, district_name}] }
      const arr: DistrictOption[] = data?.districts ?? [];
      setDistricts(arr);
    } catch (e) {
      console.error('Failed to fetch districts:', e);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  return {
    states,
    districts,
    loadingStates,
    loadingDistricts,
    errorStates,
    fetchDistricts,
  };
}
