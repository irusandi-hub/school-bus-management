export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="admin-page-head">
        <div>
          <h1>Memuat data…</h1>
          <p>Mengambil data terbaru dari database.</p>
        </div>
      </div>
      <div className="loading-grid">
        <div className="panel loading-block" />
        <div className="panel loading-block loading-block-tall" />
      </div>
    </div>
  );
}
