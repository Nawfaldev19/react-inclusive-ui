export interface SkeletonProps {
  width?: string;
  height?: string;
}

/** Placeholder shape shown while content loads. Hidden from assistive technology. */
export function Skeleton({ width = "100%", height = "1rem" }: SkeletonProps) {
  return <span className="th-skeleton" style={{ width, height }} aria-hidden="true" />;
}
