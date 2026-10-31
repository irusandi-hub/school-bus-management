export type UserRole = "admin" | "operator" | "driver" | "parent";

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
  operator_id: string | null;
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
  profile_id: string | null;
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
  schools: { name: string; city?: string | null } | null;
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

export type RouteDirection = "morning" | "afternoon";

export type RouteRow = {
  id: string;
  route_name: string;
  school_name: string;
  direction: RouteDirection;
  active: boolean;
  approved_at: string | null;
  route_stops?: { id: string }[];
};

export type RouteStopRow = {
  id: string;
  route_id: string;
  stop_order: number;
  stop_name: string;
  latitude: number;
  longitude: number;
  is_school: boolean;
};

export type StudentRouteStopRow = {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  direction: RouteDirection;
  active: boolean;
  route_stops: { stop_name: string; stop_order: number } | null;
  students: { full_name: string; admissions_number: string } | null;
};

export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed";

export type TripAssignmentRow = {
  id: string;
  route_id: string;
  driver_id: string;
  bus_id: string;
  service_date: string;
  routes: { route_name: string; school_name: string; direction: RouteDirection } | null;
  buses: { fleet_code: string; plate_number: string | null; capacity: number } | null;
  drivers: { full_name: string; phone: string | null } | null;
  trips: { id: string; status: TripStatus; started_at: string | null; completed_at: string | null; arrived_at: string | null }[];
};

export type TripRow = {
  id: string;
  assignment_id: string;
  status: TripStatus;
  started_at: string | null;
  completed_at: string | null;
  arrived_at: string | null;
  created_at: string;
  trip_assignments: {
    service_date: string;
    routes: { route_name: string; school_name: string; direction: RouteDirection } | null;
    buses: { fleet_code: string; plate_number: string | null } | null;
    drivers: { full_name: string } | null;
  } | null;
};

export type TripEventType = "boarded" | "dropped_off" | "absent" | "issue";

export type TripEventRow = {
  id: number;
  trip_id: string;
  student_id: string;
  event_type: TripEventType;
  occurred_at: string;
  notes: string | null;
};

export type AuditLogRow = {
  id: number;
  actor_profile_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
};
