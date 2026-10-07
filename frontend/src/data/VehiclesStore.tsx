import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import * as api from '@/src/api/vehicles';
import { useAuth } from '@/src/auth/AuthProvider';

export type Vehicle = api.VehicleWithDetails;
export type VehicleInput = api.VehicleRequest;

type VehiclesContextValue = {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addVehicle: (input: VehicleInput, model: api.VehicleModel) => Promise<void>;
  updateVehicle: (id: string, input: VehicleInput, model: api.VehicleModel) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
};

const VehiclesContext = createContext<VehiclesContextValue | null>(null);

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  // Remount the store on account changes to discard the previous account's data.
  return <AccountVehiclesProvider key={session?.user.id ?? 'signed-out'} signedIn={Boolean(session)}>
    {children}
  </AccountVehiclesProvider>;
}

function AccountVehiclesProvider({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(signedIn);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!signedIn) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const savedVehicles = await api.getVehicles();
      if (active.current && id === requestId.current) {
        setVehicles(savedVehicles);
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load vehicles.');
      }
    } finally {
      if (active.current && id === requestId.current) setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    active.current = true;
    void refresh();
    return () => { active.current = false; ++requestId.current; };
  }, [refresh]);

  const addVehicle = useCallback(async (input: VehicleInput, model: api.VehicleModel) => {
    const saved = await api.addVehicle(input);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => [{ ...saved, vehicle_models: model }, ...current]);
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, input: VehicleInput, model: api.VehicleModel) => {
    const saved = await api.updateVehicle(id, input);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => current.map((vehicle) => vehicle.vehicle_id === id ? { ...saved, vehicle_models: model } : vehicle));
    }
  }, []);

  const removeVehicle = useCallback(async (id: string) => {
    await api.deleteVehicle(id);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => current.filter((vehicle) => vehicle.vehicle_id !== id));
    }
  }, []);

  const value = useMemo(() => ({ vehicles, loading, error, refresh, addVehicle, updateVehicle, removeVehicle }),
    [vehicles, loading, error, refresh, addVehicle, updateVehicle, removeVehicle]);
  return <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>;
}

export function useVehicles() {
  const context = useContext(VehiclesContext);
  if (!context) throw new Error('useVehicles must be used within a VehiclesProvider');
  return context;
}
