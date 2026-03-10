import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // ReportStatus type
  type ReportStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Report type
  type Report = {
    id : Nat;
    city : Text;
    amount : Nat;
    department : Text;
    description : Text;
    officerName : ?Text;
    corruptionType : Text;
    photo : ?Storage.ExternalBlob;
    createdAt : Int;
    status : ReportStatus;
  };

  module Report {
    public func compareByMostRecent(r1 : Report, r2 : Report) : Order.Order {
      Int.compare(r2.createdAt, r1.createdAt);
    };
  };

  include MixinStorage();

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // Persistent data structures
  var reportId = 0;

  // Map for storing reports by ID
  let reports = Map.empty<Nat, Report>();

  // Kept for stable variable compatibility with previous version (no longer actively used)
  var pendingReports : [Report] = [];

  // Track admin principal directly - this is the sole source of truth for admin access
  var adminPrincipal : ?Principal = null;

  // Safe admin check using adminPrincipal only (never traps)
  func callerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (adminPrincipal) {
      case (?ap) { Principal.equal(caller, ap) };
      case (null) { false };
    };
  };

  // Check if caller is admin
  public query ({ caller }) func checkCallerIsAdmin() : async Bool {
    callerIsAdmin(caller);
  };

  // Claim admin: only works if no admin has been assigned yet via claimAdmin.
  // Uses adminPrincipal as sole source of truth so it is unaffected by
  // _initializeAccessControlWithSecret setting accessControlState.adminAssigned.
  public shared ({ caller }) func claimAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    switch (adminPrincipal) {
      case (?_) {
        // Admin already claimed by someone
        return false;
      };
      case (null) {
        // First caller claims admin
        adminPrincipal := ?caller;
        // Keep roles map in sync (add is upsert, safe to call even if already registered)
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
        return true;
      };
    };
  };

  // Check if admin has been claimed yet.
  // Checks adminPrincipal directly so it is not confused by
  // _initializeAccessControlWithSecret setting adminAssigned for regular users.
  public query func isAdminClaimed() : async Bool {
    switch (adminPrincipal) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // Create a report
  public shared ({ caller }) func createReport(department : Text, city : Text, corruptionType : Text, amount : Nat, description : Text, officerName : ?Text, photo : ?Storage.ExternalBlob) : async Report {
    let id = reportId;
    let report : Report = {
      id;
      city;
      amount;
      department;
      description;
      officerName;
      corruptionType;
      createdAt = Time.now();
      status = #pending;
      photo;
    };

    reports.add(id, report);
    reportId += 1;
    report;
  };

  // Get a report by ID
  public query ({ caller }) func getReport(id : Nat) : async ?Report {
    switch (reports.get(id)) {
      case (?report) {
        if (report.status != #approved and not callerIsAdmin(caller)) {
          Runtime.trap("Unauthorized: Only approved reports are publicly accessible");
        };
        ?report;
      };
      case (null) { null };
    };
  };

  // Get all approved reports
  public query ({ caller }) func getApprovedReports() : async [Report] {
    reports.values().filter(func(report) { report.status == #approved }).toArray();
  };

  // Get all reports (admin only)
  public query ({ caller }) func getAllReports() : async [Report] {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can get all reports");
    };
    reports.values().toArray();
  };

  // Get all pending reports (admin only)
  public query ({ caller }) func getPendingReports() : async [Report] {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can get all pending reports");
    };
    reports.values().filter(func(report) { report.status == #pending }).toArray();
  };

  // Approve a report (admin only)
  public shared ({ caller }) func approveReport(id : Nat) : async () {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve reports");
    };

    switch (reports.get(id)) {
      case (?report) {
        let updatedReport : Report = { report with status = #approved };
        reports.add(id, updatedReport);
      };
      case (null) { Runtime.trap("Report does not exist") };
    };
  };

  // Reject a report (admin only)
  public shared ({ caller }) func rejectReport(id : Nat) : async () {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can reject reports");
    };

    switch (reports.get(id)) {
      case (?report) {
        let updatedReport : Report = { report with status = #rejected };
        reports.add(id, updatedReport);
      };
      case (null) { Runtime.trap("Report does not exist") };
    };
  };
};
