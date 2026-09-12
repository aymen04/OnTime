export const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const PLANNING_SLOTS = [
  { key: 'morning', label: '6–14', startMinutes: 6 * 60, endMinutes: 14 * 60 },
  { key: 'afternoon', label: '14–22', startMinutes: 14 * 60, endMinutes: 22 * 60 },
  { key: 'night', label: '22–6', startMinutes: 22 * 60, endMinutes: 30 * 60 },
] as const;

export const AVAILABILITY_MIN = 6 * 60;
export const AVAILABILITY_MAX = 30 * 60;

export type RoleName = 'manager' | 'employee';

export type Company = {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type Role = {
  id: string;
  company_id: string;
  name: RoleName;
  permissions: Record<string, boolean>;
};

export type Profile = {
  id: string;
  auth_id: string;
  email: string | null;
  full_name: string | null;
  company_id: string | null;
  role_id: string | null;
  is_active: boolean;
  role?: Role | null;
  company?: Company | null;
};

export type Availability = {
  id: string;
  employee_id: string;
  company_id: string;
  day_of_week: number;
  start_minutes: number;
  end_minutes: number;
};

export type Shift = {
  id: string;
  company_id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  position_label: string | null;
  notes: string | null;
  created_by: string | null;
  employee?: Pick<Profile, 'id' | 'full_name' | 'email'>;
};

export type TicketType = 'time_off' | 'issue';
export type TicketStatus = 'pending' | 'approved' | 'rejected';

export type Ticket = {
  id: string;
  company_id: string;
  author_id: string;
  type: TicketType;
  title: string;
  body: string | null;
  status: TicketStatus;
  created_at: string;
  author?: Pick<Profile, 'id' | 'full_name' | 'email'>;
};
