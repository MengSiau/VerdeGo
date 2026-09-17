import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: string;
  seats: string;
  colour: string;
  fuelType: FuelType;
  plate: string;
  ridesCompleted: number;
  totalCo2Kg: number;
};

export type VehicleInput = Omit<Vehicle, 'id' | 'ridesCompleted' | 'totalCo2Kg'>;

type VehiclesContextValue = {
  vehicles: Vehicle[];
  addVehicle: (input: VehicleInput) => void;
  updateVehicle: (id: string, input: VehicleInput) => void;
  removeVehicle: (id: string) => void;
};

const VehiclesContext = createContext<VehiclesContextValue | null>(null);

// Seed data mirrors the example vehicle from the Figma mockups.
const initialVehicles: Vehicle[] = [
  {
    id: 'seed-1',
    make: 'Toyota',
    model: 'Corolla Hybrid',
    year: '2021',
    seats: '4',
    colour: 'Celestite Grey',
    fuelType: 'Hybrid',
    plate: 'ABC 123',
    ridesCompleted: 34,
    totalCo2Kg: 42.6,
  },
];

// In-memory mock store for a user's vehicles. No backend is connected yet -
// this just keeps state alive while navigating between My Vehicles and the
// add/edit vehicle form. Replace with real API calls once auth/backend exists.
export function VehiclesProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const addVehicle = useCallback((input: VehicleInput) => {
    setVehicles((current) => [
      ...current,
      { ...input, id: `vehicle-${Date.now()}`, ridesCompleted: 0, totalCo2Kg: 0 },
    ]);
  }, []);

  const updateVehicle = useCallback((id: string, input: VehicleInput) => {
    setVehicles((current) =>
      current.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...input } : vehicle))
    );
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));
  }, []);

  const value = useMemo(
    () => ({ vehicles, addVehicle, updateVehicle, removeVehicle }),
    [vehicles, addVehicle, updateVehicle, removeVehicle]
  );

  return <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>;
}

export function useVehicles() {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
}
