// Grid density per breakpoint: 4×4 phone, 8×8 tablet, 16×16 laptop, 32×32 desktop.
const TIERS = [
  { divisions: 4, className: 'block sm:hidden' },
  { divisions: 8, className: 'hidden sm:block lg:hidden' },
  { divisions: 16, className: 'hidden lg:block xl:hidden' },
  { divisions: 32, className: 'hidden xl:block' },
];

function Grid({ divisions, className }: { divisions: number; className: string }) {
  const stops = Array.from({ length: divisions - 1 }, (_, i) => ((i + 1) / divisions) * 100);
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-10 h-full w-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g stroke="#ffffff" strokeOpacity={0.12} strokeWidth={0.5}>
        {stops.map((p) => (
          <line key={`v${p}`} x1={p} y1={0} x2={p} y2={100} vectorEffect="non-scaling-stroke" />
        ))}
        {stops.map((p) => (
          <line key={`h${p}`} x1={0} y1={p} x2={100} y2={p} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

export function GridOverlay() {
  return (
    <>
      {TIERS.map((t) => (
        <Grid key={t.divisions} {...t} />
      ))}
    </>
  );
}
