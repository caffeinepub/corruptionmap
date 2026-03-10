import { ReportStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  formatAmount,
  relativeTime,
  useApproveReport,
  useClaimAdmin,
  useGetAllReports,
  useGetPendingReports,
  useIsAdminClaimed,
  useIsCallerAdmin,
  useRejectReport,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  Check,
  Clock,
  ImageIcon,
  IndianRupee,
  Loader2,
  Lock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Report } from "../backend.d";

const STATUS_COLORS: Record<string, string> = {
  [ReportStatus.pending]: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  [ReportStatus.approved]: "bg-green-500/20 text-green-400 border-green-500/30",
  [ReportStatus.rejected]: "bg-red-500/20 text-red-400 border-red-500/30",
};

function ReportCard({
  report,
  showActions,
}: {
  report: Report;
  showActions: boolean;
}) {
  const { mutateAsync: approve, isPending: approving } = useApproveReport();
  const { mutateAsync: reject, isPending: rejecting } = useRejectReport();
  const [photoOpen, setPhotoOpen] = useState(false);

  const handleApprove = async () => {
    try {
      await approve(report.id);
      toast.success("Report approved and published.");
    } catch {
      toast.error("Failed to approve report.");
    }
  };

  const handleReject = async () => {
    try {
      await reject(report.id);
      toast.success("Report rejected.");
    } catch {
      toast.error("Failed to reject report.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="report-card-border bg-card rounded-lg border border-border p-6 shadow-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={STATUS_COLORS[report.status] ?? ""}
          >
            {report.status}
          </Badge>
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
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

      {/* Officer name */}
      {report.officerName && (
        <div className="flex items-center gap-2 mb-3 text-sm text-amber-400/90">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium">Officer: {report.officerName}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {report.description}
      </p>

      {/* Photo */}
      {report.photo && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setPhotoOpen(!photoOpen)}
            className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {photoOpen ? "Hide" : "View"} evidence photo
          </button>
          {photoOpen && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border">
              <img
                src={report.photo.getDirectURL()}
                alt="Evidence"
                className="w-full max-h-64 object-contain bg-secondary/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60"
            onClick={handleApprove}
            disabled={approving || rejecting}
            data-ocid="admin.report.confirm_button"
          >
            {approving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
            onClick={handleReject}
            disabled={approving || rejecting}
            data-ocid="admin.report.delete_button"
          >
            {rejecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5">Reject</span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { login, loginStatus, isInitializing, identity } =
    useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const isLoggedIn = !!identity;

  const { data: adminClaimed, isLoading: checkingClaimed } =
    useIsAdminClaimed();
  const { mutateAsync: claimAdmin, isPending: claiming } = useClaimAdmin();

  const { data: pendingReports, isLoading: loadingPending } =
    useGetPendingReports();
  const { data: allReports, isLoading: loadingAll } = useGetAllReports();

  const approvedReports = allReports?.filter(
    (r) => r.status === ReportStatus.approved,
  );
  const rejectedReports = allReports?.filter(
    (r) => r.status === ReportStatus.rejected,
  );

  const handleLogin = async () => {
    await login();
    queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
  };

  const handleClaimAdmin = async () => {
    try {
      const success = await claimAdmin();
      if (success) {
        toast.success("Admin access claimed successfully!");
      } else {
        toast.error("Could not claim admin access.");
      }
    } catch {
      toast.error("Failed to claim admin access.");
    }
  };

  if (isInitializing || checkingAdmin) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="bg-grid-pattern min-h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div
              data-ocid="admin.error_state"
              className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 border border-destructive/30"
            >
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display font-black text-3xl text-foreground mb-3">
              Admin Access
            </h1>
            <p className="text-muted-foreground mb-8">
              Log in with Internet Identity to access the admin panel.
            </p>
            <Button
              size="lg"
              className="w-full font-semibold glow-saffron"
              onClick={handleLogin}
              disabled={isLoggingIn}
              data-ocid="admin.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Admin Login
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    if (checkingClaimed) {
      return (
        <div
          className="flex items-center justify-center min-h-[60vh]"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      );
    }

    // Admin slot available — let them claim it
    if (!adminClaimed) {
      return (
        <div className="bg-grid-pattern min-h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
          <div className="relative container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/30">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display font-black text-3xl text-foreground mb-3">
                Claim Admin Access
              </h1>
              <p className="text-muted-foreground mb-8">
                No admin has been assigned yet. As the first authenticated user,
                you can claim administrator privileges.
              </p>
              <Button
                size="lg"
                className="w-full font-semibold glow-saffron"
                onClick={handleClaimAdmin}
                disabled={claiming}
                data-ocid="admin.primary_button"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Claim Admin Access
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    // Admin already claimed by someone else
    return (
      <div className="bg-grid-pattern min-h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div
              data-ocid="admin.error_state"
              className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 border border-destructive/30"
            >
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display font-black text-3xl text-foreground mb-3">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              Admin access has already been assigned to another user. Contact
              the current administrator for access.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-grid-pattern min-h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      <div className="relative container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display font-black text-4xl text-foreground mb-2">
            Report Review
          </h1>
          <p className="text-muted-foreground">
            Review, approve, or reject submitted reports before they appear
            publicly.
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList
            className="mb-6 bg-secondary/50 border border-border"
            data-ocid="admin.filter.tab"
          >
            <TabsTrigger value="pending" data-ocid="admin.pending.tab">
              Pending
              {pendingReports && pendingReports.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-mono">
                  {pendingReports.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" data-ocid="admin.approved.tab">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" data-ocid="admin.rejected.tab">
              Rejected
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {loadingPending ? (
              <div className="space-y-4" data-ocid="admin.loading_state">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border border-border p-6"
                  >
                    <Skeleton className="h-5 w-56 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : pendingReports && pendingReports.length > 0 ? (
              <div className="space-y-4" data-ocid="admin.pending.list">
                {pendingReports.map((report, idx) => (
                  <div
                    key={report.id.toString()}
                    data-ocid={`admin.report.item.${idx + 1}`}
                  >
                    <ReportCard report={report} showActions />
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="admin.pending.empty_state"
                className="text-center py-24 border border-dashed border-border rounded-lg"
              >
                <Check className="w-10 h-10 text-green-400/50 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">
                  All clear
                </h3>
                <p className="text-muted-foreground text-sm">
                  No reports pending review.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved">
            {loadingAll ? (
              <div data-ocid="admin.loading_state" className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border border-border p-6"
                  >
                    <Skeleton className="h-5 w-56 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : approvedReports && approvedReports.length > 0 ? (
              <div className="space-y-4" data-ocid="admin.approved.list">
                {approvedReports.map((report, idx) => (
                  <div
                    key={report.id.toString()}
                    data-ocid={`admin.report.item.${idx + 1}`}
                  >
                    <ReportCard report={report} showActions={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="admin.approved.empty_state"
                className="text-center py-24 border border-dashed border-border rounded-lg"
              >
                <p className="text-muted-foreground text-sm">
                  No approved reports.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected">
            {loadingAll ? (
              <div data-ocid="admin.loading_state" className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border border-border p-6"
                  >
                    <Skeleton className="h-5 w-56 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : rejectedReports && rejectedReports.length > 0 ? (
              <div className="space-y-4" data-ocid="admin.rejected.list">
                {rejectedReports.map((report, idx) => (
                  <div
                    key={report.id.toString()}
                    data-ocid={`admin.report.item.${idx + 1}`}
                  >
                    <ReportCard report={report} showActions={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="admin.rejected.empty_state"
                className="text-center py-24 border border-dashed border-border rounded-lg"
              >
                <p className="text-muted-foreground text-sm">
                  No rejected reports.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
