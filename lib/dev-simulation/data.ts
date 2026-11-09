import { DEV_COMPANY, DEV_DRIVER_RECORD, DEV_VIEWER } from "../dev-open-access.ts";

/**
 * Dataset simulasi untuk mode akses terbuka pengembangan (DEC-024).
 *
 * Seluruh baris adalah contoh fiktif: kode memakai awalan `SIM-`, nama memakai kata
 * "Contoh", dan alamat/email memakai domain `example.test`. Tidak ada data siswa,
 * wali, nomor telepon, alamat, atau koordinat rumah nyata di berkas ini. Data ini
 * hanya dimuat ketika mode dev aktif dan tidak pernah tersentuh di produksi.
 */

export type SimRow = Record<string, unknown>;
export type SimTables = Record<string, SimRow[]>;

function iso(daysAgo = 0, hoursAgo = 0) {
  const now = Date.now() - daysAgo * 86_400_000 - hoursAgo * 3_600_000;
  return new Date(now).toISOString();
}

function today() {
  return iso().slice(0, 10);
}

function yesterday() {
  return iso(1).slice(0, 10);
}

const { operator, driver, parent } = DEV_VIEWER;

export const DEV_IDS = {
  operator: DEV_COMPANY.id,
  driver: DEV_DRIVER_RECORD.id,
  guardian: "51111111-0000-4000-8000-0000000005f1",
} as const;

export function createSimulationTables(): SimTables {
  return {
    profiles: [
      {
        id: operator.userId,
        full_name: operator.fullName,
        role: "operator",
        phone: "+966 50 000 0002",
        created_at: iso(60),
        updated_at: iso(60),
      },
      {
        id: driver.userId,
        full_name: driver.fullName,
        role: "driver",
        phone: "+966 50 000 0003",
        created_at: iso(60),
        updated_at: iso(60),
      },
      {
        id: parent.userId,
        full_name: parent.fullName,
        role: "parent",
        phone: "+966 50 000 0004",
        created_at: iso(60),
        updated_at: iso(60),
      },
    ],

    operators: [
      {
        id: DEV_COMPANY.id,
        name: DEV_COMPANY.name,
        code: "SIM-OP-01",
        city: "Dammam",
        contact_name: "Manajer Armada Contoh",
        contact_email: "kontak.perusahaan@example.test",
        contact_phone: "+966 50 000 0002",
        profile_id: null,
        active: true,
        created_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-0000000001b2",
        name: "Perusahaan Bus Contoh Cadangan",
        code: "SIM-OP-02",
        city: "Dammam",
        contact_name: "Manajer Contoh Dua",
        contact_email: "perusahaan.dua@example.test",
        contact_phone: null,
        profile_id: null,
        active: false,
        created_at: iso(45),
      },
    ],

    schools: [
      {
        id: "51111111-0000-4000-8000-0000000002c1",
        name: "Sekolah Contoh Nusantara",
        code: "SIM-SCH-01",
        city: "Dammam",
        address: "Jalan Contoh Nomor 1, Dammam",
        latitude: 26.4208,
        longitude: 50.0812,
        contact_name: "Kepala Sekolah Contoh",
        contact_email: "sekolah.contoh@example.test",
        contact_phone: "+966 50 000 0005",
        operator_id: DEV_COMPANY.id,
        active: true,
        created_at: iso(60),
        updated_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-0000000002c2",
        name: "Sekolah Contoh Cabang",
        code: "SIM-SCH-02",
        city: "Dammam",
        address: "Jalan Contoh Nomor 2, Dammam",
        latitude: 26.3971,
        longitude: 50.1135,
        contact_name: "Kepala Sekolah Contoh Dua",
        contact_email: "sekolah.dua@example.test",
        contact_phone: null,
        operator_id: null,
        active: false,
        created_at: iso(45),
        updated_at: iso(45),
      },
    ],

    buses: [
      {
        id: "51111111-0000-4000-8000-0000000003d1",
        fleet_code: "SIM-BUS-01",
        plate_number: "SIM 1001",
        capacity: 40,
        model: "Contoh Model A",
        notes: "Armada simulasi untuk pengujian tampilan.",
        operator_id: DEV_COMPANY.id,
        active: true,
        created_at: iso(60),
        updated_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-0000000003d2",
        fleet_code: "SIM-BUS-02",
        plate_number: "SIM 1002",
        capacity: 30,
        model: "Contoh Model B",
        notes: "Armada simulasi yang masih bebas pada tanggal layanan hari ini.",
        operator_id: DEV_COMPANY.id,
        active: true,
        created_at: iso(45),
        updated_at: iso(45),
      },
      {
        id: "51111111-0000-4000-8000-0000000003d3",
        fleet_code: "SIM-BUS-03",
        plate_number: "SIM 1003",
        capacity: 24,
        model: "Contoh Model C",
        notes: "Armada simulasi yang sudah dipakai perjalanan berlangsung hari ini.",
        operator_id: DEV_COMPANY.id,
        active: true,
        created_at: iso(40),
        updated_at: iso(40),
      },
      {
        id: "51111111-0000-4000-8000-0000000003d4",
        fleet_code: "SIM-BUS-04",
        plate_number: "SIM 1004",
        capacity: 18,
        model: "Contoh Model D",
        notes: "Armada simulasi cadangan, sengaja dinonaktifkan untuk menguji penolakan penugasan.",
        operator_id: DEV_COMPANY.id,
        active: false,
        created_at: iso(35),
        updated_at: iso(35),
      },
    ],

    drivers: [
      {
        id: DEV_DRIVER_RECORD.id,
        full_name: DEV_DRIVER_RECORD.fullName,
        phone: "+966 50 000 0003",
        license_number: "SIM-LIC-001",
        operator_id: DEV_COMPANY.id,
        profile_id: driver.userId,
        active: true,
        created_at: iso(60),
        updated_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-0000000004e2",
        full_name: "Pengemudi Contoh Dua",
        phone: "+966 50 000 0006",
        license_number: "SIM-LIC-002",
        operator_id: DEV_COMPANY.id,
        profile_id: null,
        active: true,
        created_at: iso(30),
        updated_at: iso(30),
      },
      {
        id: "51111111-0000-4000-8000-0000000004e3",
        full_name: "Pengemudi Contoh Tiga",
        phone: "+966 50 000 0007",
        license_number: "SIM-LIC-003",
        operator_id: DEV_COMPANY.id,
        profile_id: null,
        active: true,
        created_at: iso(25),
        updated_at: iso(25),
      },
    ],

    guardians: [
      {
        id: DEV_IDS.guardian,
        profile_id: parent.userId,
        email: parent.email,
        full_name: parent.fullName,
        phone: "+966 50 000 0004",
        active: true,
        created_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-0000000005f2",
        profile_id: null,
        email: "wali.contoh.dua@example.test",
        full_name: "Wali Contoh Dua",
        phone: null,
        active: true,
        created_at: iso(20),
      },
    ],

    students: [
      {
        id: "51111111-0000-4000-8000-000000000601",
        admissions_number: "SIM-ADM-001",
        full_name: "Siswa Contoh Satu",
        date_of_birth: "2015-04-12",
        school_id: "51111111-0000-4000-8000-0000000002c1",
        guardian_id: DEV_IDS.guardian,
        home_address: "Alamat Contoh Satu, Dammam",
        home_latitude: 26.3901,
        home_longitude: 50.1052,
        pickup_notes: "Titik jemput contoh di depan taman.",
        service_status: "active",
        service_status_changed_at: iso(30),
        created_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-000000000602",
        admissions_number: "SIM-ADM-002",
        full_name: "Siswa Contoh Dua",
        date_of_birth: "2016-09-02",
        school_id: "51111111-0000-4000-8000-0000000002c1",
        guardian_id: DEV_IDS.guardian,
        home_address: "Alamat Contoh Dua, Dammam",
        home_latitude: 26.4012,
        home_longitude: 50.0933,
        pickup_notes: "Titik jemput contoh di halte bus sekolah.",
        service_status: "active",
        service_status_changed_at: iso(30),
        created_at: iso(60),
      },
      {
        id: "51111111-0000-4000-8000-000000000603",
        admissions_number: "SIM-ADM-003",
        full_name: "Siswa Contoh Tiga",
        date_of_birth: "2014-12-21",
        school_id: "51111111-0000-4000-8000-0000000002c1",
        guardian_id: DEV_IDS.guardian,
        home_address: "Alamat Contoh Tiga, Dammam",
        home_latitude: 26.4105,
        home_longitude: 50.0745,
        pickup_notes: null,
        service_status: "paused",
        service_status_changed_at: iso(3),
        created_at: iso(55),
      },
    ],

    student_service_status_history: [
      {
        id: 1,
        student_id: "51111111-0000-4000-8000-000000000601",
        previous_status: null,
        new_status: "active",
        reason: "Contoh aktivasi layanan siswa pada data simulasi.",
        changed_at: iso(30),
        actor_profile_id: operator.userId,
      },
      {
        id: 2,
        student_id: "51111111-0000-4000-8000-000000000603",
        previous_status: "active",
        new_status: "paused",
        reason: "Contoh penonaktifan layanan untuk menguji tampilan status.",
        changed_at: iso(3),
        actor_profile_id: operator.userId,
      },
    ],

    routes: [
      {
        id: "51111111-0000-4000-8000-000000000711",
        route_name: "Rute Contoh Pagi",
        school_name: "Sekolah Contoh Nusantara",
        direction: "morning",
        active: true,
        approved_at: iso(7),
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000712",
        route_name: "Rute Contoh Sore",
        school_name: "Sekolah Contoh Nusantara",
        direction: "afternoon",
        active: true,
        approved_at: iso(7),
        created_at: iso(20),
      },
    ],

    route_stops: [
      {
        id: "51111111-0000-4000-8000-000000000811",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_order: 1,
        stop_name: "Halte Contoh Utara",
        latitude: 26.4301,
        longitude: 50.0901,
        is_school: false,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000812",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_order: 2,
        stop_name: "Perumahan Contoh Timur",
        latitude: 26.4152,
        longitude: 50.1023,
        is_school: false,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000813",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_order: 3,
        stop_name: "Taman Contoh Selatan",
        latitude: 26.4031,
        longitude: 50.0902,
        is_school: false,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000814",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_order: 4,
        stop_name: "Sekolah Contoh Nusantara",
        latitude: 26.4208,
        longitude: 50.0812,
        is_school: true,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000815",
        route_id: "51111111-0000-4000-8000-000000000712",
        stop_order: 1,
        stop_name: "Sekolah Contoh Nusantara",
        latitude: 26.4208,
        longitude: 50.0812,
        is_school: true,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000816",
        route_id: "51111111-0000-4000-8000-000000000712",
        stop_order: 2,
        stop_name: "Taman Contoh Selatan",
        latitude: 26.4031,
        longitude: 50.0902,
        is_school: false,
        created_at: iso(20),
      },
      {
        id: "51111111-0000-4000-8000-000000000817",
        route_id: "51111111-0000-4000-8000-000000000712",
        stop_order: 3,
        stop_name: "Halte Contoh Utara",
        latitude: 26.4301,
        longitude: 50.0901,
        is_school: false,
        created_at: iso(20),
      },
    ],

    student_route_stops: [
      {
        id: "51111111-0000-4000-8000-000000000911",
        student_id: "51111111-0000-4000-8000-000000000601",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_id: "51111111-0000-4000-8000-000000000812",
        direction: "morning",
        active: true,
      },
      {
        id: "51111111-0000-4000-8000-000000000912",
        student_id: "51111111-0000-4000-8000-000000000602",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_id: "51111111-0000-4000-8000-000000000813",
        direction: "morning",
        active: true,
      },
      {
        id: "51111111-0000-4000-8000-000000000913",
        student_id: "51111111-0000-4000-8000-000000000601",
        route_id: "51111111-0000-4000-8000-000000000712",
        stop_id: "51111111-0000-4000-8000-000000000816",
        direction: "afternoon",
        active: true,
      },
      {
        id: "51111111-0000-4000-8000-000000000914",
        student_id: "51111111-0000-4000-8000-000000000603",
        route_id: "51111111-0000-4000-8000-000000000711",
        stop_id: "51111111-0000-4000-8000-000000000812",
        direction: "morning",
        active: false,
      },
    ],

    trip_assignments: [
      {
        id: "51111111-0000-4000-8000-000000000a11",
        route_id: "51111111-0000-4000-8000-000000000711",
        driver_id: DEV_DRIVER_RECORD.id,
        bus_id: "51111111-0000-4000-8000-0000000003d1",
        service_date: today(),
        assigned_by: operator.userId,
        created_at: iso(0, 3),
      },
      {
        id: "51111111-0000-4000-8000-000000000a12",
        route_id: "51111111-0000-4000-8000-000000000712",
        driver_id: "51111111-0000-4000-8000-0000000004e2",
        bus_id: "51111111-0000-4000-8000-0000000003d3",
        service_date: today(),
        assigned_by: operator.userId,
        created_at: iso(0, 3),
      },
      {
        id: "51111111-0000-4000-8000-000000000a13",
        route_id: "51111111-0000-4000-8000-000000000711",
        driver_id: DEV_DRIVER_RECORD.id,
        bus_id: "51111111-0000-4000-8000-0000000003d1",
        service_date: yesterday(),
        assigned_by: operator.userId,
        created_at: iso(1),
      },
    ],

    trips: [
      {
        id: "51111111-0000-4000-8000-000000000b11",
        assignment_id: "51111111-0000-4000-8000-000000000a11",
        status: "scheduled",
        started_at: null,
        arrived_at: null,
        completed_at: null,
        created_at: iso(0, 3),
      },
      {
        id: "51111111-0000-4000-8000-000000000b12",
        assignment_id: "51111111-0000-4000-8000-000000000a12",
        status: "in_progress",
        started_at: iso(0, 1),
        arrived_at: iso(0, 0.5),
        completed_at: null,
        created_at: iso(0, 3),
      },
      {
        id: "51111111-0000-4000-8000-000000000b13",
        assignment_id: "51111111-0000-4000-8000-000000000a13",
        status: "completed",
        started_at: iso(1, 5),
        arrived_at: iso(1, 4),
        completed_at: iso(1, 3),
        created_at: iso(1),
      },
    ],

    trip_live_locations: [
      {
        trip_id: "51111111-0000-4000-8000-000000000b12",
        driver_id: "51111111-0000-4000-8000-0000000004e2",
        latitude: 26.4185,
        longitude: 50.0868,
        accuracy_meters: 18,
        recorded_at: iso(0),
        updated_at: iso(0),
      },
    ],

    trip_student_events: [
      {
        id: 1,
        trip_id: "51111111-0000-4000-8000-000000000b12",
        student_id: "51111111-0000-4000-8000-000000000601",
        event_type: "boarded",
        recorded_by: driver.userId,
        occurred_at: iso(0, 1),
        notes: "Contoh pencatatan siswa naik bus.",
      },
      {
        id: 2,
        trip_id: "51111111-0000-4000-8000-000000000b13",
        student_id: "51111111-0000-4000-8000-000000000601",
        event_type: "dropped_off",
        recorded_by: driver.userId,
        occurred_at: iso(1, 3),
        notes: null,
      },
      {
        id: 3,
        trip_id: "51111111-0000-4000-8000-000000000b13",
        student_id: "51111111-0000-4000-8000-000000000602",
        event_type: "dropped_off",
        recorded_by: driver.userId,
        occurred_at: iso(1, 3),
        notes: null,
      },
      {
        id: 4,
        trip_id: "51111111-0000-4000-8000-000000000b13",
        student_id: "51111111-0000-4000-8000-000000000603",
        event_type: "absent",
        recorded_by: driver.userId,
        occurred_at: iso(1, 5),
        notes: "Contoh catatan siswa tidak ikut.",
      },
    ],

    audit_logs: [
      {
        id: 1,
        actor_profile_id: operator.userId,
        action: "insert",
        entity_type: "students",
        entity_id: "51111111-0000-4000-8000-000000000601",
        summary: "Contoh catatan audit: siswa simulasi ditambahkan.",
        created_at: iso(30),
      },
      {
        id: 2,
        actor_profile_id: operator.userId,
        action: "update",
        entity_type: "students",
        entity_id: "51111111-0000-4000-8000-000000000603",
        summary: "Contoh catatan audit: status layanan siswa diubah menjadi nonaktif.",
        created_at: iso(3),
      },
    ],
  };
}
