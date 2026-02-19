import { useState, useEffect, useCallback } from 'react';

// Use Edge Function proxy to avoid CORS issues
const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-proxy`;

function proxyUrl(path: string, query?: string): string {
  const params = new URLSearchParams({ path });
  if (query) params.set('query', query);
  return `${PROXY_BASE}?${params.toString()}`;
}

export interface StateOption {
  id: number;
  name: string;
  code: string;
}

export interface DistrictOption {
  id: number;
  name: string;
  state_id: number;
}

export interface MandalOption {
  id: number;
  name: string;
  district_id: number;
}

function extractItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as T[];
    if (Array.isArray(d.items)) return d.items as T[];
    if (Array.isArray(d.results)) return d.results as T[];
  }
  return [];
}

export function useIndiaLocations() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [mandals, setMandals] = useState<MandalOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);

  useEffect(() => {
    setLoadingStates(true);
    fetch(proxyUrl('/locations/states'))
      .then(res => res.json())
      .then(data => setStates(extractItems<StateOption>(data)))
      .catch(console.error)
      .finally(() => setLoadingStates(false));
  }, []);

  const fetchDistricts = useCallback(async (stateId: number) => {
    setDistricts([]);
    setMandals([]);
    setLoadingDistricts(true);
    try {
      const res = await fetch(proxyUrl('/locations/districts', `state_id=${stateId}`));
      const data = await res.json();
      setDistricts(extractItems<DistrictOption>(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchMandals = useCallback(async (districtId: number) => {
    setMandals([]);
    setLoadingMandals(true);
    try {
      const res = await fetch(proxyUrl('/locations/talukas', `district_id=${districtId}`));
      const data = await res.json();
      setMandals(extractItems<MandalOption>(data));
    } catch (e) {
      console.error(e);
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
    fetchDistricts,
    fetchMandals,
  };
}
