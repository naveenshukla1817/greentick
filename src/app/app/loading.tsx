export default function WorkspaceLoading() {
  return (
    <div className="workspace-loading" role="status" aria-live="polite" aria-label="Loading workspace">
      <div className="loading-heading">
        <span className="loading-line loading-team" />
        <span className="loading-line loading-title" />
        <span className="loading-line loading-subtitle" />
      </div>
      <div className="loading-metrics">
        {Array.from({ length: 4 }).map((_, index) => <div className="loading-surface loading-metric" key={index}><span className="loading-line"/><span className="loading-line loading-number"/><span className="loading-line loading-note"/></div>)}
      </div>
      <div className="loading-body-grid">
        <div className="loading-surface loading-activity"><span className="loading-line loading-section-title"/>{Array.from({ length: 4 }).map((_, index) => <div className="loading-row" key={index}><span className="loading-avatar"/><span className="loading-lines"><i/><i/></span><span className="loading-pill"/></div>)}</div>
        <div className="loading-side"><div className="loading-surface loading-panel"><span className="loading-line loading-section-title"/><i/><i/><i/></div><div className="loading-surface loading-panel"><span className="loading-line loading-section-title"/><i/><i/></div></div>
      </div>
      <span className="loading-status-text">Loading workspace…</span>
    </div>
  );
}
