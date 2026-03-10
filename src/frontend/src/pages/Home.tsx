import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatAmount,
  relativeTime,
  useGetAllReports,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  MapPin,
  User,
} from "lucide-react";
import { motion } from "motion/react";

const CORRUPTION_COLORS: Record<string, string> = {
  Bribery: "bg-destructive/20 text-destructive border-destructive/30",
  Extortion: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Fraud: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Nepotism: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Embezzlement: "bg-red-800/20 text-red-400 border-red-800/30",
  Other: "bg-muted text-muted-foreground border-border",
};

const SAMPLE_REPORTS = [
  {
    id: 1n,
    department: "Municipal Corporation",
    city: "Delhi",
    corruptionType: "Bribery",
    amount: 25000n,
    officerName: "J. Sharma",
    description:
      "Building permit officer demanded ₹25,000 cash to expedite commercial property registration. Refused to process paperwork without payment.",
    createdAt: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
  },
  {
    id: 2n,
    department: "Regional Transport Office",
    city: "Mumbai",
    corruptionType: "Fraud",
    amount: 8000n,
    officerName: undefined,
    description:
      "RTO agent collected ₹8,000 claiming it was a government fee for driving license renewal. Official fee is ₹400. No receipt provided.",
    createdAt: BigInt(Date.now() - 5 * 3600 * 1000) * 1_000_000n,
  },
  {
    id: 3n,
    department: "Public Works Department",
    city: "Bangalore",
    corruptionType: "Embezzlement",
    amount: 1500000n,
    officerName: "R. Patel (Contractor)",
    description:
      "Road repair contract awarded at 3x market rate to relative of senior official. Work substandard with potholes reappearing within 2 weeks.",
    createdAt: BigInt(Date.now() - 1 * 86400 * 1000) * 1_000_000n,
  },
  {
    id: 4n,
    department: "State Electricity Board",
    city: "Hyderabad",
    corruptionType: "Extortion",
    amount: 3500n,
    officerName: undefined,
    description:
      "Lineman demanded bribe to restore power connection after scheduled maintenance. Threatened 3-day delay if payment not made.",
    createdAt: BigInt(Date.now() - 2 * 86400 * 1000) * 1_000_000n,
  },
  {
    id: 5n,
    department: "District Collector Office",
    city: "Chennai",
    corruptionType: "Nepotism",
    amount: 0n,
    officerName: "K. Murugan",
    description:
      "Junior administrative positions filled exclusively with relatives of senior officer. 47 qualified candidates passed test but were not called for interview.",
    createdAt: BigInt(Date.now() - 3 * 86400 * 1000) * 1_000_000n,
  },
];

export default function Home() {
  const { data: reports, isLoading } = useGetAllReports();

  const displayReports =
    reports && reports.length > 0 ? reports : SAMPLE_REPORTS;

  return (
    <div className="bg-grid-pattern min-h-full">
      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">
                Live Intelligence Feed
              </span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-4">
              India Corruption
              <span className="block text-primary">Reports</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              A transparent, citizen-powered platform for documenting and
              exposing corruption across India's public institutions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/report">
                <Button
                  size="lg"
                  className="font-semibold glow-saffron"
                  data-ocid="home.primary_button"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Corruption
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/map">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-medium border-border text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View Map
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reports */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">
              Recent Reports
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? "Loading..."
                : `${displayReports.length} report${
                    displayReports.length !== 1 ? "s" : ""
                  } on record`}
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4" data-ocid="home.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="report-card-border bg-card rounded-lg p-6 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayReports.length === 0 && (
          <div
            data-ocid="home.empty_state"
            className="text-center py-24 border border-dashed border-border rounded-lg"
          >
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">
              No reports yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Be the first to document corruption in your area.
            </p>
            <Link to="/report">
              <Button size="sm">File the First Report</Button>
            </Link>
          </div>
        )}

        {/* Report list */}
        {!isLoading && displayReports.length > 0 && (
          <div className="space-y-4" data-ocid="home.report.list">
            {displayReports.map((report, idx) => (
              <motion.div
                key={report.id.toString()}
                data-ocid={`home.report.item.${idx + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                className="report-card-border bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors shadow-card group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        CORRUPTION_COLORS[report.corruptionType] ??
                        CORRUPTION_COLORS.Other
                      }
                    >
                      {report.corruptionType}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      {report.department}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {report.city}
                    </span>
                    {report.officerName && (
                      <span className="flex items-center gap-1 text-sm text-amber-400/80">
                        <User className="w-3.5 h-3.5" />
                        {report.officerName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {Number(report.amount) > 0 && (
                      <span className="flex items-center gap-1 font-mono font-semibold text-sm text-primary">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {formatAmount(report.amount)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {relativeTime(report.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-foreground/70 transition-colors">
                  {report.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
