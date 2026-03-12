const legends = [
  { label: "Hayz", className: "bg-cycle-menstruation" },
  { label: "Follikulyar", className: "bg-cycle-follicular" },
  { label: "Ovulyatsiya", className: "bg-cycle-ovulation" },
  { label: "Luteal", className: "bg-cycle-luteal" },
  { label: "Taxminiy", className: "bg-cycle-predicted" },
];

const CycleLegend = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
    {legends.map((l) => (
      <div key={l.label} className="flex items-center gap-1.5">
        <div className={`w-3 h-3 rounded-full ${l.className}`} />
        <span className="text-muted-foreground">{l.label}</span>
      </div>
    ))}
  </div>
);

export default CycleLegend;
