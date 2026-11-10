import { Icon } from "@/components/ui/Icon";
import { StudentStatusControls } from "./StudentStatusControls";

export type StudentListRow = {
  key: string;
  studentId: string;
  name: string;
  admissionsNumber: string | null;
  stopOrder: number;
  stopName: string;
  address: string | null;
  /** Status kehadiran terakhir (boarded/dropped_off/absent). */
  status: string | null;
  issueNote: string | null;
};

/**
 * Daftar siswa pada halaman operasional, mengikuti urutan rute yang terkunci.
 * Setiap siswa memiliki kontrol status sendiri sehingga klik ganda pada satu
 * siswa tidak mengunci tindakan siswa lain dan status terbaru langsung terlihat.
 */
export function StudentList({
  rows,
  tripId,
  assignmentId,
  direction,
  tripStatus,
  arrived,
}: {
  rows: StudentListRow[];
  tripId: string | null;
  assignmentId: string;
  direction: string;
  tripStatus: string;
  arrived: boolean;
}) {
  return (
    <div className="ops-students-scroll">
      <ol className="ops-students">
        {rows.map((row, index) => (
          <li className="ops-student" key={row.key} id={`siswa-${row.studentId}`}>
            <span className="ops-student-num" aria-label={`Urutan ${index + 1}`}>
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="ops-student-main">
              <div className="ops-student-title">
                <strong>{row.name}</strong>
              </div>
              <small className="ops-student-addr">
                <Icon name="pin" size={12} />
                {row.stopOrder}. {row.stopName}
                {row.admissionsNumber ? ` · ${row.admissionsNumber}` : ""}
              </small>
              {row.address && (
                <details className="ops-student-more">
                  <summary>Alamat</summary>
                  <small className="ops-student-addr">
                    <Icon name="home" size={12} /> {row.address} <span className="ops-data-note">data induk</span>
                  </small>
                </details>
              )}
            </div>

            <StudentStatusControls
              studentId={row.studentId}
              tripId={tripId}
              assignmentId={assignmentId}
              direction={direction}
              tripStatus={tripStatus}
              arrived={arrived}
              initialStatus={row.status}
              initialIssueNote={row.issueNote}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
