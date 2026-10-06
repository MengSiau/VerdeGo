import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import * as api from '@/src/api/vehicles';
import { useAuth } from '@/src/auth/AuthProvider';

export type Vehicle = api.VehicleWithDetails;
export type VehicleInput = api.VehicleRequest;

type VehiclesContextValue = {
  vehicles: Vehicle[];
  models: api.VehicleModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addVehicle: (input: VehicleInput) => Promise<void>;
  updateVehicle: (id: string, input: VehicleInput) => Promise<void>;
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
  const [models, setModels] = useState<api.VehicleModel[]>([]);
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
      const [savedVehicles, savedModels] = await Promise.all([api.getVehicles(), api.getVehicleModels()]);
      if (active.current && id === requestId.current) {
        setVehicles(savedVehicles);
        setModels(savedModels);
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

  const withModel = useCallback((vehicle: api.Vehicle): Vehicle => {
    const model = models.find((item) => item.model_id === vehicle.model_id);
    return { ...vehicle, vehicle_models: model ?? null };
  }, [models]);

  const addVehicle = useCallback(async (input: VehicleInput) => {
    const saved = await api.addVehicle(input);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => [withModel(saved), ...current]);
    }
  }, [withModel]);

  const updateVehicle = useCallback(async (id: string, input: VehicleInput) => {
    const saved = await api.updateVehicle(id, input);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => current.map((vehicle) => vehicle.vehicle_id === id ? withModel(saved) : vehicle));
    }
  }, [withModel]);

  const removeVehicle = useCallback(async (id: string) => {
    await api.deleteVehicle(id);
    if (active.current) {
      ++requestId.current;
      setLoading(false);
      setVehicles((current) => current.filter((vehicle) => vehicle.vehicle_id !== id));
    }
  }, []);

  const value = useMemo(() => ({ vehicles, models, loading, error, refresh, addVehicle, updateVehicle, removeVehicle }),
    [vehicles, models, loading, error, refresh, addVehicle, updateVehicle, removeVehicle]);
  return <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>;
}

export function useVehicles() {
  const context = useContext(VehiclesContext);
  if (!context) throw new Error('useVehicles must be used within a VehiclesProvider');
  return context;
}
