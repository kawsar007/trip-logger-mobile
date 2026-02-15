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
  distance: number | string;  // Allow string for input, but should be number in storage
  time: string;            // HH:MM
  description?: string;

  startTravelTime?: string;
  endTravelTime?: string;
};

export type DateRange = {
  from: string;
  to: string;
};