'use client';

export default function SkeletonCards({ count = 5 }) {
  return (
    <div className="skeleton-cards-row">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-block" />
          <div className="skeleton-card-lines">
            <div className="skeleton-block" style={{ height: 10, width: '70%' }} />
            <div className="skeleton-block" style={{ height: 16, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
