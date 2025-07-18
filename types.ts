export interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  activity: string;
  cost?: string;
  location?: string;
}

export interface UIChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface NearbyPlace {
  name: string;
  description: string;
  address: string;
}