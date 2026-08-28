import type { LocationIn } from "../types/api";

interface Props {
  locations: LocationIn[];
  onChange: (locations: LocationIn[]) => void;
}

const SITE_LABELS = ["SITE A", "SITE B", "SITE C", "SITE D", "SITE E"];

export default function LocationInputList({ locations, onChange }: Props) {
  function update(index: number, field: keyof LocationIn, value: string) {
    const next = [...locations];
    if (field === "name") {
      next[index] = { ...next[index], name: value };
    } else {
      const num = parseFloat(value);
      next[index] = { ...next[index], [field]: Number.isNaN(num) ? 0 : num };
    }
    onChange(next);
  }

  function addLocation() {
    if (locations.length >= 5) return;
    onChange([...locations, { name: "", latitude: 0, longitude: 0 }]);
  }

  function removeLocation(index: number) {
    onChange(locations.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {locations.map((loc, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
        >
          <span className="text-[10px] font-mono tracking-widest text-signal shrink-0 w-14">
            {SITE_LABELS[i] ?? `SITE ${i + 1}`}
          </span>
          <input
            className="flex-1 bg-transparent border-b border-border-soft focus:border-signal outline-none text-sm py-1 placeholder:text-ink-faint"
            placeholder="Location name (e.g. Phoenix Construction Zone)"
            value={loc.name}
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <div className="flex gap-2 shrink-0">
            <input
              className="w-28 bg-transparent border-b border-border-soft focus:border-signal outline-none text-sm py-1 font-mono placeholder:text-ink-faint"
              placeholder="Latitude"
              value={loc.latitude || ""}
              onChange={(e) => update(i, "latitude", e.target.value)}
            />
            <input
              className="w-28 bg-transparent border-b border-border-soft focus:border-signal outline-none text-sm py-1 font-mono placeholder:text-ink-faint"
              placeholder="Longitude"
              value={loc.longitude || ""}
              onChange={(e) => update(i, "longitude", e.target.value)}
            />
          </div>
          {locations.length > 1 && (
            <button
              onClick={() => removeLocation(i)}
              className="text-ink-faint hover:text-thermal-critical text-sm shrink-0 px-2"
              aria-label={`Remove ${loc.name || "location"}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {locations.length < 5 && (
        <button
          onClick={addLocation}
          className="w-full rounded-lg border border-dashed border-border-soft py-3 text-sm text-ink-muted hover:text-ink hover:border-ink-faint transition-colors"
        >
          + Add location
        </button>
      )}
    </div>
  );
}
