import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, useGetReports } from "@/hooks/useQueries";
import { BarChart3, IndianRupee, MapPin } from "lucide-react";
import { motion } from "motion/react";

// Fix Leaflet default icon in Vite
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CITY_COORDS: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Patna: [25.5941, 85.1376],
  Bhopal: [23.2599, 77.4126],
};

const CORRUPTION_COLORS_HEX: Record<string, string> = {
  Bribery: "#ef4444",
  Extortion: "#f97316",
  Fraud: "#eab308",
  Nepotism: "#a855f7",
  Embezzlement: "#dc2626",
  Other: "#6b7280",
};

function createCustomIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; border: 2px solid rgba(255,255,255,0.8);
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.6);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.setView([22.5, 82.0], 5);
  }, [map]);
  return null;
}

const SAMPLE_REPORTS = [
  {
    id: 1n,
    department: "Municipal Corporation",
    city: "Delhi",
    corruption_type: "Bribery",
    amount: 25000n,
    description: "Building permit bribery",
    created_at: 0n,
  },
  {
    id: 2n,
    department: "RTO",
    city: "Mumbai",
    corruption_type: "Fraud",
    amount: 8000n,
    description: "Driving license fraud",
    created_at: 0n,
  },
  {
    id: 3n,
    department: "PWD",
    city: "Bangalore",
    corruption_type: "Embezzlement",
    amount: 1500000n,
    description: "Contract embezzlement",
    created_at: 0n,
  },
  {
    id: 4n,
    department: "Electricity Board",
    city: "Hyderabad",
    corruption_type: "Extortion",
    amount: 3500n,
    description: "Power connection extortion",
    created_at: 0n,
  },
  {
    id: 5n,
    department: "Collector Office",
    city: "Chennai",
    corruption_type: "Nepotism",
    amount: 0n,
    description: "Job nepotism",
    created_at: 0n,
  },
  {
    id: 6n,
    department: "Police",
    city: "Kolkata",
    corruption_type: "Bribery",
    amount: 15000n,
    description: "FIR registration bribery",
    created_at: 0n,
  },
  {
    id: 7n,
    department: "Land Registry",
    city: "Pune",
    corruption_type: "Fraud",
    amount: 50000n,
    description: "Property registration fraud",
    created_at: 0n,
  },
];

export default function MapView() {
  const { data: reports, isLoading } = useGetReports();
  const displayReports =
    reports && reports.length > 0 ? reports : SAMPLE_REPORTS;
  const mappedReports = displayReports.filter((r) => r.city in CITY_COORDS);

  const totalBribes = displayReports.reduce(
    (acc, r) => acc + Number(r.amount),
    0,
  );

  return (
    <div className="min-h-full">
      {/* Header */}
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

            {/* Stats */}
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

      {/* Map */}
      <div
        className="relative"
        style={{ height: "calc(100vh - 380px)", minHeight: "500px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <MapContainer
          center={[22.5, 82.0]}
          zoom={5}
          style={{ height: "100%", width: "100%", background: "#0a0e1a" }}
          zoomControl={true}
        >
          <MapController />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {mappedReports.map((report, idx) => {
            const coords = CITY_COORDS[report.city];
            if (!coords) return null;
            const color =
              CORRUPTION_COLORS_HEX[report.corruption_type] ?? "#6b7280";
            return (
              <Marker
                key={`${report.id}-${idx}`}
                position={coords}
                icon={createCustomIcon(color)}
              >
                <Popup>
                  <div
                    className="text-sm font-sans min-w-[180px]"
                    data-ocid="map.map_marker"
                  >
                    <div className="font-bold text-base mb-1">
                      {report.city}
                    </div>
                    <div className="text-gray-600 mb-1">
                      {report.department}
                    </div>
                    <div className="mb-1">
                      <span
                        style={{ background: color, color: "#fff" }}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {report.corruption_type}
                      </span>
                    </div>
                    {Number(report.amount) > 0 && (
                      <div className="font-semibold text-green-700">
                        ₹{formatAmount(report.amount)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <section className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Corruption Type Legend
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CORRUPTION_COLORS_HEX).map(([type, color]) => (
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
        </div>
      </section>
    </div>
  );
}
