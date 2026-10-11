export type RouteSkeletonKind = "dashboard" | "tasks" | "reviews" | "team" | "settings" | "notifications" | "detail";

export function RouteSkeleton({ kind }: { kind: RouteSkeletonKind }) {
  const rows = kind === "dashboard" ? 4 : kind === "team" ? 3 : 5;
  return (
    <div className={`route-skeleton route-skeleton-${kind}`} aria-label={`Loading ${kind}`} role="status">
      <div className="skeleton-title-block"><span className="skeleton-line skeleton-eyebrow"/><span className="skeleton-line skeleton-title"/><span className="skeleton-line skeleton-subtitle"/></div>
      {kind === "dashboard" ? <div className="skeleton-metrics">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-panel skeleton-metric" key={index}><i/><b/><small/></div>)}</div> : null}
      <div className={`skeleton-panels ${kind === "dashboard" ? "skeleton-dashboard-panels" : ""}`}>
        <section className="skeleton-panel"><span className="skeleton-line skeleton-panel-title"/>{Array.from({ length: rows }, (_, index) => <div className="skeleton-row" key={index}><i/><span><b/><small/></span><em/></div>)}</section>
        {kind === "dashboard" || kind === "team" || kind === "detail" ? <section className="skeleton-panel skeleton-secondary-panel"><span className="skeleton-line skeleton-panel-title"/><i/><i/><i/></section> : null}
      </div>
    </div>
  );
}
