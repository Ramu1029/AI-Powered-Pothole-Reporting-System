import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'https://india-location-hub.in/api';

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

export function useIndiaLocations() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [mandals, setMandals] = useState<MandalOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    setLoadingStates(true);
    fetch(`${BASE_URL}/locations/states`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then((data: StateOption[]) => setStates(data))
      .catch(console.error)
      .finally(() => setLoadingStates(false));
  }, []);

  const fetchDistricts = useCallback(async (stateId: number) => {
    setDistricts([]);
    setMandals([]);
    setLoadingDistricts(true);
    try {
      const res = await fetch(`${BASE_URL}/locations/districts?state_id=${stateId}`, {
        headers: { Accept: 'application/json' },
      });
      const data: DistrictOption[] = await res.json();
      setDistricts(data);
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
      const res = await fetch(`${BASE_URL}/locations/talukas?district_id=${districtId}`, {
        headers: { Accept: 'application/json' },
      });
      const data: MandalOption[] = await res.json();
      setMandals(data);
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
