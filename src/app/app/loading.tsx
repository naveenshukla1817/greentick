export default function WorkspaceLoading() {
  return (
    <div className="workspace-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading workspace…</span>
      <div className="workspace-loading-top">
        <div>
          <div className="workspace-skeleton workspace-loading-line short" />
          <div className="workspace-skeleton workspace-loading-title" />
          <div className="workspace-skeleton workspace-loading-subtitle" />
        </div>
        <div className="workspace-loading-actions">
          <div className="workspace-skeleton workspace-loading-action" />
          <div className="workspace-skeleton workspace-loading-action" />
        </div>
      </div>
      <div className="workspace-loading-metrics">
        {Array.from({ length: 4 }, (_, index) => <div className="workspace-skeleton workspace-loading-metric" key={index} />)}
      </div>
      <div className="workspace-loading-grid">
        <div className="workspace-loading-column">
          <section className="workspace-loading-card">
            <div className="workspace-skeleton workspace-loading-line short" />
            <div className="workspace-skeleton workspace-loading-line medium" />
            {Array.from({ length: 4 }, (_, index) => <div className="workspace-skeleton workspace-loading-row" key={index} />)}
          </section>
          <section className="workspace-loading-card">
            <div className="workspace-skeleton workspace-loading-line short" />
            {Array.from({ length: 3 }, (_, index) => <div className="workspace-skeleton workspace-loading-row" key={index} />)}
          </section>
        </div>
        <div className="workspace-loading-column">
          <section className="workspace-loading-card">
            <div className="workspace-skeleton workspace-loading-line short" />
            <div className="workspace-skeleton workspace-loading-row" />
            <div className="workspace-skeleton workspace-loading-row" />
          </section>
          <section className="workspace-loading-card">
            <div className="workspace-skeleton workspace-loading-line short" />
            <div className="workspace-skeleton workspace-loading-metric" />
          </section>
        </div>
      </div>
    </div>
  );
}
