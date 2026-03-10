import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, useGetApprovedReports } from "@/hooks/useQueries";
import { BarChart3, IndianRupee, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// India states GeoJSON with state/UT boundaries
const GEO_URL =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";

const SVG_W = 600;
const SVG_H = 680;
// India bounding box including full claimed territory: lng 66-97.5, lat 6-38.5
const LNG_MIN = 66;
const LNG_MAX = 97.5;
const LAT_MIN = 6;
const LAT_MAX = 38.5;

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

function ringToPath(ring: number[][]): string {
  return `${ring
    .map(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ")} Z`;
}

function geometryToPath(geometry: {
  type: string;
  coordinates: number[][][] | number[][][][];
}): string {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as number[][][]).map(ringToPath).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .flatMap((poly) => poly.map(ringToPath))
      .join(" ");
  }
  return "";
}

// Single continuous polygon for India's full claimed northern territory:
// PoK + Shaksgam Valley + Aksai Chin, merged without any gap.
// Coordinates trace the outer boundary clockwise (lng, lat).
const NORTHERN_TERRITORY_COORDS: [number, number][] = [
  // Western edge of PoK
  [72.4, 36.2],
  [72.8, 37.1],
  [73.5, 37.6],
  // Northern PoK, heading east into Shaksgam Valley
  [74.6, 37.8],
  [75.5, 37.4],
  [76.3, 37.3],
  [77.2, 37.1],
  // Shaksgam / Trans-Karakoram Tract, continuing into Aksai Chin
  [78.0, 36.8],
  [79.2, 36.3],
  [80.0, 36.1],
  [81.0, 35.6],
  // Eastern edge of Aksai Chin
  [80.8, 34.6],
  [79.8, 34.1],
  // Southern boundary of Aksai Chin going west
  [78.7, 34.2],
  [78.0, 34.6],
  // Connecting south of Shaksgam to southern PoK
  [77.0, 34.9],
  [76.0, 35.2],
  [75.3, 35.5],
  // Southern boundary of PoK going west
  [74.4, 34.5],
  [73.5, 34.0],
  [73.0, 34.8],
  [72.4, 35.5],
  // Close polygon
  [72.4, 36.2],
];

function coordsToPath(coords: [number, number][]): string {
  return `${coords
    .map(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ")} Z`;
}

const CITY_COORDS: Record<string, [number, number]> = {
  Delhi: [77.21, 28.61],
  Mumbai: [72.88, 19.08],
  Bangalore: [77.59, 12.97],
  Chennai: [80.27, 13.08],
  Kolkata: [88.37, 22.57],
  Hyderabad: [78.48, 17.38],
  Pune: [73.86, 18.52],
  Ahmedabad: [72.58, 23.03],
  Jaipur: [75.79, 26.91],
  Lucknow: [80.95, 26.85],
  Patna: [85.14, 25.61],
  Bhopal: [77.41, 23.26],
};

const CITY_TO_STATE: Record<string, string> = {
  Delhi: "Delhi",
  Mumbai: "Maharashtra",
  Bangalore: "Karnataka",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Hyderabad: "Telangana",
  Pune: "Maharashtra",
  Ahmedabad: "Gujarat",
  Jaipur: "Rajasthan",
  Lucknow: "Uttar Pradesh",
  Patna: "Bihar",
  Bhopal: "Madhya Pradesh",
};

const CORRUPTION_COLORS: Record<string, string> = {
  Bribery: "#ef4444",
  Extortion: "#f97316",
  Fraud: "#eab308",
  Nepotism: "#a855f7",
  Embezzlement: "#dc2626",
  Other: "#6b7280",
};

function getHeatmapColor(count: number): string {
  if (count === 0) return "#1e3a5f";
  if (count === 1) return "#7c3d00";
  if (count === 2) return "#b45309";
  return "#dc2626";
}

const SAMPLE_REPORTS = [
  {
    id: 1n,
    department: "Municipal Corporation",
    city: "Delhi",
    corruptionType: "Bribery",
    amount: 25000n,
    description: "Building permit bribery",
    createdAt: 0n,
  },
  {
    id: 2n,
    department: "RTO",
    city: "Mumbai",
    corruptionType: "Fraud",
    amount: 8000n,
    description: "Driving license fraud",
    createdAt: 0n,
  },
  {
    id: 3n,
    department: "PWD",
    city: "Bangalore",
    corruptionType: "Embezzlement",
    amount: 1500000n,
    description: "Contract embezzlement",
    createdAt: 0n,
  },
  {
    id: 4n,
    department: "Electricity Board",
    city: "Hyderabad",
    corruptionType: "Extortion",
    amount: 3500n,
    description: "Power connection extortion",
    createdAt: 0n,
  },
  {
    id: 5n,
    department: "Collector Office",
    city: "Chennai",
    corruptionType: "Nepotism",
    amount: 0n,
    description: "Job nepotism",
    createdAt: 0n,
  },
  {
    id: 6n,
    department: "Police",
    city: "Kolkata",
    corruptionType: "Bribery",
    amount: 15000n,
    description: "FIR registration bribery",
    createdAt: 0n,
  },
  {
    id: 7n,
    department: "Land Registry",
    city: "Pune",
    corruptionType: "Fraud",
    amount: 50000n,
    description: "Property registration fraud",
    createdAt: 0n,
  },
];

type Report = (typeof SAMPLE_REPORTS)[number];
type ViewMode = "markers" | "heatmap";

interface GeoFeature {
  rsmKey?: string;
  properties: Record<string, string>;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

function getStateName(props: Record<string, string>): string {
  return props.NAME_1 ?? props.st_nm ?? props.name ?? props.STATE ?? "";
}

export default function MapView() {
  const { data: reports, isLoading } = useGetApprovedReports();
  const displayReports =
    reports && reports.length > 0 ? reports : SAMPLE_REPORTS;
  const mappedReports = displayReports.filter((r) => r.city in CITY_COORDS);
  const totalBribes = displayReports.reduce(
    (acc, r) => acc + Number(r.amount),
    0,
  );
  const [tooltip, setTooltip] = useState<{
    report: Report;
    x: number;
    y: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("markers");
  const [geographies, setGeographies] = useState<GeoFeature[]>([]);
  const [geoLoading, setGeoLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    setGeoLoading(true);
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setGeographies(
            (data.features ?? []).map((f: GeoFeature, i: number) => ({
              ...f,
              rsmKey: String(i),
            })),
          );
          setGeoLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setGeoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute state report counts for heatmap
  const stateReportCounts: Record<string, number> = {};
  for (const report of displayReports) {
    const state = CITY_TO_STATE[report.city];
    if (state) {
      stateReportCounts[state] = (stateReportCounts[state] ?? 0) + 1;
    }
  }

  const northernFill = viewMode === "heatmap" ? getHeatmapColor(0) : "#1e3a5f";

  return (
    <div className="min-h-full">
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">
                Live Intelligence Map
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mb-6">
              Corruption Map — India
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Total Reports
                </div>
                <span className="font-display font-bold text-2xl text-foreground">
                  {displayReports.length}
                </span>
              </div>
              <div className="bg-card border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Cities Mapped
                </div>
                <span className="font-display font-bold text-2xl text-foreground">
                  {mappedReports.length}
                </span>
              </div>
              <div className="bg-card border border-border rounded-lg px-4 py-3 col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Total Documented
                </div>
                <span className="font-display font-bold text-2xl text-primary">
                  ₹{formatAmount(BigInt(totalBribes))}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative bg-card">
        {(isLoading || geoLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Skeleton className="w-full h-64" data-ocid="map.loading_state" />
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          {/* View mode toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-border bg-background p-1 gap-1">
              <button
                type="button"
                data-ocid="map.tab"
                onClick={() => setViewMode("markers")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "markers"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Markers
              </button>
              <button
                type="button"
                data-ocid="map.tab"
                onClick={() => setViewMode("heatmap")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "heatmap"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>

          <div
            className="relative w-full max-w-2xl mx-auto rounded-xl border border-border overflow-hidden bg-[#0f172a]"
            onMouseLeave={() => setTooltip(null)}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width="100%"
              role="img"
              aria-label="Political map of India showing full claimed territory"
              style={{ display: "block" }}
            >
              {/* SVG defs for hatch pattern on northern territory */}
              <defs>
                <pattern
                  id="hatch-north"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeOpacity="0.45"
                  />
                </pattern>
              </defs>

              {/* Northern territory overlay drawn FIRST so state boundaries render on top */}
              <path
                d={coordsToPath(NORTHERN_TERRITORY_COORDS)}
                fill={northernFill}
                stroke="#fbbf24"
                strokeWidth={1.2}
                strokeDasharray="3 2"
                opacity={0.9}
                style={{ transition: "fill 0.4s ease" }}
              />
              <path
                d={coordsToPath(NORTHERN_TERRITORY_COORDS)}
                fill="url(#hatch-north)"
                stroke="none"
                opacity={1}
              />

              {/* State boundaries rendered on top of northern territory */}
              {geographies.map((geo) => {
                const stateName = getStateName(geo.properties);
                const count = stateReportCounts[stateName] ?? 0;
                const fillColor =
                  viewMode === "heatmap" ? getHeatmapColor(count) : "#1e3a5f";
                const d = geometryToPath(geo.geometry);
                return (
                  <path
                    key={geo.rsmKey}
                    d={d}
                    fill={fillColor}
                    stroke="#4a9edd"
                    strokeWidth={0.6}
                    style={{ transition: "fill 0.4s ease" }}
                  />
                );
              })}

              {/* City markers (markers mode only) */}
              {viewMode === "markers" &&
                mappedReports.map((report, idx) => {
                  const coords = CITY_COORDS[report.city];
                  if (!coords) return null;
                  const [px, py] = project(coords[0], coords[1]);
                  const color =
                    CORRUPTION_COLORS[report.corruptionType] ??
                    CORRUPTION_COLORS.Other;
                  const isHovered = tooltip?.report.id === report.id;
                  return (
                    <g
                      key={`${report.id}-${idx}`}
                      data-ocid="map.map_marker"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => {
                        const svgEl = svgRef.current;
                        if (!svgEl) return;
                        const svgRect = svgEl.getBoundingClientRect();
                        const scaleX = svgRect.width / SVG_W;
                        const scaleY = svgRect.height / SVG_H;
                        setTooltip({
                          report: report as Report,
                          x: px * scaleX,
                          y: py * scaleY,
                        });
                      }}
                    >
                      <circle
                        cx={px}
                        cy={py}
                        r={9}
                        fill={color}
                        opacity={0.2}
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r={isHovered ? 7 : 5}
                        fill={color}
                        stroke="white"
                        strokeWidth={1}
                        opacity={0.95}
                        style={{ transition: "r 0.15s" }}
                      />
                      <text
                        x={px}
                        y={py - 13}
                        textAnchor="middle"
                        style={{
                          fontSize: 8,
                          fill: "rgba(255,255,255,0.85)",
                          fontFamily: "monospace",
                          pointerEvents: "none",
                        }}
                      >
                        {report.city}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Tooltip (markers mode) */}
            {viewMode === "markers" &&
              tooltip &&
              (() => {
                const color =
                  CORRUPTION_COLORS[tooltip.report.corruptionType] ??
                  CORRUPTION_COLORS.Other;
                return (
                  <div
                    className="pointer-events-none absolute z-20 bg-popover border border-border rounded-lg p-3 text-xs shadow-xl"
                    style={{
                      left: tooltip.x + 14,
                      top: Math.max(4, tooltip.y - 30),
                      maxWidth: 180,
                    }}
                  >
                    <div className="font-bold text-foreground mb-1">
                      {tooltip.report.city}
                    </div>
                    <div className="text-muted-foreground">
                      {tooltip.report.department}
                    </div>
                    <div className="mt-1 font-medium" style={{ color }}>
                      {tooltip.report.corruptionType}
                    </div>
                    {Number(tooltip.report.amount) > 0 && (
                      <div className="text-primary font-semibold mt-0.5">
                        ₹{formatAmount(tooltip.report.amount)}
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>

          {/* Heatmap legend */}
          {viewMode === "heatmap" && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Report Density
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex rounded overflow-hidden border border-border">
                  {[
                    { color: "#1e3a5f", label: "0" },
                    { color: "#7c3d00", label: "1" },
                    { color: "#b45309", label: "2" },
                    { color: "#dc2626", label: "3+" },
                  ].map(({ color, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center justify-end"
                      style={{ background: color, width: 40, height: 28 }}
                    >
                      <span
                        className="text-[10px] font-mono mb-0.5"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          {viewMode === "markers" && (
            <>
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Corruption Type Legend
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(CORRUPTION_COLORS).map(([type, color]) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="gap-1.5 border-border"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    {type}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {viewMode === "heatmap" && (
            <>
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                State Report Counts
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stateReportCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => (
                    <Badge
                      key={state}
                      variant="outline"
                      className="gap-1.5 border-border"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: getHeatmapColor(count) }}
                      />
                      {state}: {count}
                    </Badge>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
