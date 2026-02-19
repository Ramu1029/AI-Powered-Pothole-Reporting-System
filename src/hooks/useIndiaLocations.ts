import { useState, useEffect, useCallback } from 'react';

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-proxy`;

export interface StateOption {
  code: string;   // e.g. "28" — used as state identifier
  name: string;
}

export interface DistrictOption {
  code: string;   // e.g. "532" — used as district identifier
  id: number;
  name: string;
  state_code: string;
}

export interface MandalOption {
  code: string;   // district_code / taluka_code
  id: number;
  name: string;
  district_code: string;
}

export function useIndiaLocations() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [mandals, setMandals] = useState<MandalOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);
  const [errorStates, setErrorStates] = useState<string | null>(null);

  // Fetch all states on mount
  useEffect(() => {
    setLoadingStates(true);
    setErrorStates(null);
    fetch(`${PROXY_BASE}?type=states`)
      .then(res => res.json())
      .then(data => {
        // Response: { success: true, data: { states: [{code, name, ...}], total } }
        const arr = data?.data?.states ?? [];
        setStates(arr.map((s: any) => ({ code: String(s.code), name: s.name })));
      })
      .catch(err => {
        console.error('Failed to fetch states:', err);
        setErrorStates('Failed to load states');
      })
      .finally(() => setLoadingStates(false));
  }, []);

  const fetchDistricts = useCallback(async (stateCode: string) => {
    setDistricts([]);
    setMandals([]);
    setLoadingDistricts(true);
    try {
      const res = await fetch(`${PROXY_BASE}?type=districts&state_code=${stateCode}`);
      const data = await res.json();
      // Response: { success: true, districts: [{id, code, name, state_code, ...}], total }
      const arr = data?.districts ?? data?.data?.districts ?? [];
      setDistricts(arr.map((d: any) => ({
        code: String(d.code),
        id: d.id,
        name: d.name,
        state_code: String(d.state_code),
      })));
    } catch (e) {
      console.error('Failed to fetch districts:', e);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchMandals = useCallback(async (districtCode: string) => {
    setMandals([]);
    setLoadingMandals(true);
    try {
      const res = await fetch(`${PROXY_BASE}?type=talukas&district_code=${districtCode}`);
      const data = await res.json();
      // Response: { success: true, talukas: [{id, code, name, district_code, ...}], total }
      const arr = data?.talukas ?? data?.data?.talukas ?? [];
      setMandals(arr.map((m: any) => ({
        code: String(m.code),
        id: m.id,
        name: m.name,
        district_code: String(m.district_code),
      })));
    } catch (e) {
      console.error('Failed to fetch mandals:', e);
    } finally {
      setLoadingMandals(false);
    }
  }, []);

  return {
    states,
    districts,
    mandals,
    loadingStates,
    loadingDistricts,
    loadingMandals,
    errorStates,
    fetchDistricts,
    fetchMandals,
  };
}
