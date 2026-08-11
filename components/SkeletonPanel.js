'use client';

export default function SkeletonPanel({ rows = 5 }) {
  return (
    <div className="skeleton-panel">
      <div className="skeleton-block" style={{ height: 22, width: '35%', marginBottom: 18 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton-block" style={{ flex: 2 }} />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      ))}
    </div>
  );
}
