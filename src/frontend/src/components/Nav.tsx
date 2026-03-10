import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapPin, Menu, ShieldAlert, X } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:bg-primary/30 transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-sm tracking-wide uppercase text-foreground">
            Corruption<span className="text-primary">Map</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            data-ocid="nav.home.link"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
          >
            Reports
          </Link>
          <Link
            to="/map"
            data-ocid="nav.map.link"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
          >
            Map View
          </Link>
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary [&.active]:bg-primary/10 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin
          </Link>
          <Link to="/report" data-ocid="nav.report.link">
            <Button size="sm" className="ml-2 font-medium">
              + File Report
            </Button>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          <Link
            to="/"
            data-ocid="nav.home.link"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary"
          >
            Reports
          </Link>
          <Link
            to="/map"
            data-ocid="nav.map.link"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary"
          >
            Map View
          </Link>
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors [&.active]:text-primary flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin
          </Link>
          <Link
            to="/report"
            data-ocid="nav.report.link"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-primary rounded-md bg-primary/10 transition-colors"
          >
            + File Report
          </Link>
        </div>
      )}
    </header>
  );
}
