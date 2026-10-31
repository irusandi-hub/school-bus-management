export type UserRole = "admin" | "driver" | "parent";

export type ProfileRow = {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
};

export type SchoolRow = {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  active: boolean;
};

export type OperatorRow = {
  id: string;
  name: string;
  code: string;
  city: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  active: boolean;
};

export type GuardianRow = {
  id: string;
  profile_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  active: boolean;
};

export type ServiceStatus = "active" | "paused" | "ended";

export type StudentRow = {
  id: string;
  admissions_number: string;
  full_name: string;
  date_of_birth: string | null;
  school_id: string | null;
  guardian_id: string | null;
  home_address: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  pickup_notes: string | null;
  service_status: ServiceStatus;
  service_status_changed_at: string;
  schools: { name: string } | null;
  guardians: { full_name: string; email: string; phone: string | null } | null;
};

export type StatusHistoryRow = {
  id: number;
  student_id: string;
  previous_status: string | null;
  new_status: ServiceStatus;
  reason: string;
  changed_at: string;
  profiles: { full_name: string } | null;
};

export type BusRow = {
  id: string;
  fleet_code: string;
  plate_number: string | null;
  capacity: number;
  model: string | null;
  notes: string | null;
  operator_id: string | null;
  active: boolean;
  operators: { name: string } | null;
};

export type DriverRow = {
  id: string;
  full_name: string;
  phone: string | null;
  license_number: string | null;
  operator_id: string | null;
  profile_id: string | null;
  active: boolean;
  operators: { name: string } | null;
};
