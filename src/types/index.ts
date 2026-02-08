export type Profile = {
  id?: number;
  name: string;
  email: string;
  designation: string;
  phone: string;
  company: string;
};

export type Trip = {
  id?: number;
  tripDate: string;        // YYYY-MM-DD
  startDestination: string;
  endDestination: string;
  startPostal?: string;
  endPostal?: string;
  distance: number;
  time: string;            // HH:MM
  description?: string;
};