import type { SVGProps } from "react";

/**
 * Satu set ikon garis untuk seluruh aplikasi. Emoji tidak dipakai lagi di navigasi
 * dan kartu ringkasan karena tampil berbeda di setiap perangkat.
 */
const paths: Record<string, string[]> = {
  dashboard: ["M4 13h6V4H4v9Z", "M14 20h6v-9h-6v9Z", "M4 20h6v-3H4v3Z", "M14 7h6V4h-6v3Z"],
  school: ["M4 20V9.5 9.5L12 4l8 5.5V20", "M9 20v-6h6v6", "M2.5 20h19"],
  operator: ["M3 17V8l4-3h7l4 4h3v8", "M3 17h2", "M19 17h2", "M7 17h10", "M7.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M16.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M7 8h5"],
  students: ["M12 4 3 8l9 4 9-4-9-4Z", "M7 10v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5", "M21 8v5"],
  guardian: ["M12 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M5 20c.7-3.4 3.4-5.3 7-5.3s6.3 1.9 7 5.3", "M12 3.5V2M3.6 8 2.2 7.2M20.4 8l1.4-.8"],
  bus: ["M4 16.5V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9.5", "M4 12h16", "M7.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M16.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M7 8h3M14 8h3"],
  driver: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"],
  route: ["M6.5 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z", "M17.5 14.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z", "M6.5 9.5v3a4 4 0 0 0 4 4h7"],
  assignment: ["M9 4.5h6a1 1 0 0 1 1 1V6h-8v-.5a1 1 0 0 1 1-1Z", "M8 5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 18 5h-2", "m9 13 2 2 4-4"],
  trip: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7.5V12l3 2"],
  report: ["M6 3.5h8l4 4v13H6v-17Z", "M14 3.5v4h4", "M9 12h6M9 16h4"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m16 16 4 4"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  close: ["m6 6 12 12M18 6 6 18"],
  logout: ["M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20H15", "M10 8l-4 4 4 4", "M6 12h9"],
  chevronRight: ["m9.5 6 6 6-6 6"],
  chevronLeft: ["m14.5 6-6 6 6 6"],
  arrowRight: ["M4 12h15", "m13 6 6 6-6 6"],
  arrowLeft: ["M20 12H5", "m11 18-6-6 6-6"],
  check: ["m5 13 4 4 10-10"],
  alert: ["M12 4 3 20h18L12 4Z", "M12 10v4.5", "M12 17.5h.01"],
  shield: ["M12 3.5 5 6v6c0 4 3 7 7 8.5 4-1.5 7-4.5 7-8.5V6l-7-2.5Z", "m9.5 12 2 2 3.5-3.5"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5.5", "M12 8h.01"],
  pin: ["M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z", "M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  plus: ["M12 5v14M5 12h14"],
  calendar: ["M5 6.5h14A1.5 1.5 0 0 1 20.5 8v11A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V8A1.5 1.5 0 0 1 5 6.5Z", "M8 3.5v5M16 3.5v5M3.5 11h17"],
  users: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M3.5 19.5c.6-3 2.7-4.7 5.5-4.7s4.9 1.7 5.5 4.7", "M16 5.4a2.8 2.8 0 0 1 0 5.2", "M17.5 14.9c1.7.5 2.8 1.9 3.2 4.1"],
  inbox: ["M4 13.5 6 5h12l2 8.5", "M4 13.5h4l1 2.5h6l1-2.5h4V19H4v-5.5Z"],
  gpsOff: ["M12 8.5a3.5 3.5 0 0 1 3.5 3.5", "M12 20a8 8 0 0 0 6.2-12.9M5.8 7.1A8 8 0 0 0 12 20", "M12 4V2M20 12h2M2 12h2", "M3.5 3.5l17 17"],
  cameraOff: ["M3.5 7.5h11A1.5 1.5 0 0 1 16 9v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 15V9a1.5 1.5 0 0 1 1.5-1.5Z", "m16 11 5-2.5v7L16 13", "M3.5 3.5l17 17"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7.5V12l3 2"],
  refresh: ["M20 11a8 8 0 0 0-13.6-4.6L4 8.8", "M4 5v3.8h3.8", "M4 13a8 8 0 0 0 13.6 4.6L20 15.2", "M20 19v-3.8h-3.8"],
  filter: ["M4 6h16M7 12h10M10 18h4"],
  key: ["M15 9.5a3.5 3.5 0 1 1-3.4-3.5", "M11.6 9.5 4 17v3h3v-2h2v-2h2l1.6-1.6"],
  navigation: ["M12 3.5 20 20l-8-3.2L4 20l8-16.5Z"],
  camera: ["M3.5 7.5h11A1.5 1.5 0 0 1 16 9v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 15V9a1.5 1.5 0 0 1 1.5-1.5Z", "m16 11 5-2.5v7L16 13"],
  expand: ["M9 4H4v5", "M15 20h5v-5", "M20 9V4h-5", "M4 15v5h5"],
  shrink: ["M9 4v5H4", "M15 20v-5h5", "M20 9h-5V4", "M4 15h5v5"],
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 18,
  ...rest
}: { name: IconName | string; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const shape = paths[name] ?? paths.info;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shape.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
