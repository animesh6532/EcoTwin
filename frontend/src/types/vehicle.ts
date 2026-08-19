export interface Vehicle {
  id: string;
  x: number;
  y: number;
  speed: number; // km/h
  lane: string;
  type: string;
  waiting_time: number;
}
