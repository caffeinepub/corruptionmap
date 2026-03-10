import { ExternalBlob } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReport } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  ImagePlus,
  Loader2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CORRUPTION_TYPES = [
  "Bribery",
  "Extortion",
  "Fraud",
  "Nepotism",
  "Embezzlement",
  "Other",
];

function generateAnonToken(): string {
  const chars = "0123456789ABCDEF";
  let token = "ANON-";
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export default function Report() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useSubmitReport();
  const [submitted, setSubmitted] = useState(false);
  const [anonToken, setAnonToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    department: "",
    city: "",
    corruptionType: "",
    amount: "",
    description: "",
    officerName: "",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(anonToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.department ||
      !form.city ||
      !form.corruptionType ||
      !form.description
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      let photo: ExternalBlob | null = null;
      if (photoFile) {
        const buffer = await photoFile.arrayBuffer();
        photo = ExternalBlob.fromBytes(new Uint8Array(buffer));
      }
      await mutateAsync({
        department: form.department,
        city: form.city,
        corruptionType: form.corruptionType,
        amount: BigInt(form.amount ? Number.parseInt(form.amount, 10) : 0),
        description: form.description,
        officerName: form.officerName.trim() || null,
        photo,
      });
      setAnonToken(generateAnonToken());
      setSubmitted(true);
      setTimeout(() => navigate({ to: "/" }), 8000);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  return (
    <div className="bg-grid-pattern min-h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      <div className="relative container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              Secure Report
            </span>
          </div>
          <h1 className="font-display font-black text-4xl text-foreground mb-2">
            Report Corruption
          </h1>
          <p className="text-muted-foreground">
            All reports are anonymous and stored on a decentralized network.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              data-ocid="report.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-green-500/30 rounded-xl p-10 text-center glow-teal"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/40">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                Report Submitted Anonymously
              </h2>
              <p className="text-muted-foreground mb-2">
                Your report has been securely recorded and is pending admin
                review.
              </p>
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-amber-400/80">
                <Clock className="w-4 h-4" />
                <span>It will appear publicly once approved.</span>
              </div>

              {/* Token display */}
              <div
                data-ocid="report.anon_token.panel"
                className="bg-background/60 border border-green-500/40 rounded-lg px-5 py-4 mb-4 flex items-center justify-between gap-3"
              >
                <span className="font-mono text-lg font-bold text-green-300 tracking-widest select-all">
                  {anonToken}
                </span>
                <button
                  type="button"
                  data-ocid="report.copy_token.button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium shrink-0"
                  title="Copy token"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Save this code to reference your report. No identity data was
                collected.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-card"
            >
              {/* Anonymous shield indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/20">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  <span className="text-green-400 font-medium">
                    Anonymous Submission
                  </span>
                  {" — "}your identity is never stored or transmitted.
                </span>
              </div>

              {/* Pending review notice */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  <span className="text-amber-400 font-medium">
                    Review Required
                  </span>
                  {" — "}your report will be reviewed before appearing publicly.
                </span>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-foreground"
                >
                  Department <span className="text-primary">*</span>
                </Label>
                <Input
                  id="department"
                  data-ocid="report.department.input"
                  placeholder="e.g. Municipal Corporation, RTO, PWD"
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                  className="bg-secondary/50 border-border focus:border-primary/60"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-foreground"
                >
                  City <span className="text-primary">*</span>
                </Label>
                <Input
                  id="city"
                  data-ocid="report.city.input"
                  placeholder="e.g. Delhi, Mumbai, Bangalore"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  className="bg-secondary/50 border-border focus:border-primary/60"
                  required
                />
              </div>

              {/* Corruption Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Type of Corruption <span className="text-primary">*</span>
                </Label>
                <Select
                  value={form.corruptionType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, corruptionType: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="report.type.select"
                    className="bg-secondary/50 border-border focus:border-primary/60"
                  >
                    <SelectValue placeholder="Select corruption type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CORRUPTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Officer Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="officerName"
                  className="text-sm font-medium text-foreground"
                >
                  Officer / Person Involved
                  <span className="text-muted-foreground text-xs ml-2">
                    Optional
                  </span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="officerName"
                    data-ocid="report.officer.input"
                    placeholder="Name or designation of the officer"
                    value={form.officerName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, officerName: e.target.value }))
                    }
                    className="bg-secondary/50 border-border focus:border-primary/60 pl-9"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="text-sm font-medium text-foreground"
                >
                  Bribe Amount (₹)
                  <span className="text-muted-foreground text-xs ml-2">
                    Optional
                  </span>
                </Label>
                <Input
                  id="amount"
                  data-ocid="report.amount.input"
                  type="number"
                  min="0"
                  placeholder="Amount in Indian Rupees"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  className="bg-secondary/50 border-border focus:border-primary/60"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-foreground"
                >
                  Description <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="description"
                  data-ocid="report.description.textarea"
                  placeholder="Describe what happened in detail. Include dates, names if known, and any evidence you have."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="bg-secondary/50 border-border focus:border-primary/60 min-h-[140px] resize-none"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence Photo
                  <span className="text-muted-foreground text-xs ml-2">
                    Optional
                  </span>
                </Label>
                {photoPreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-border">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full max-h-56 object-cover"
                    />
                    <button
                      type="button"
                      data-ocid="report.photo.delete_button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-upload"
                    data-ocid="report.photo.upload_button"
                    className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-colors group"
                  >
                    <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload photo evidence
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      PNG, JPG up to 10MB
                    </span>
                  </label>
                )}
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold glow-saffron"
                  disabled={isPending}
                  data-ocid="report.submit_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Submit Report
                      Securely
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                This report is submitted anonymously and cannot be traced back
                to you.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
