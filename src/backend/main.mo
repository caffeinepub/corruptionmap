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

  // Track admin principal directly
  var adminPrincipal : ?Principal = null;

  func callerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (adminPrincipal) {
      case (?ap) { Principal.equal(caller, ap) };
      case (null) { false };
    };
  };

  public query ({ caller }) func checkCallerIsAdmin() : async Bool {
    callerIsAdmin(caller);
  };

  public shared ({ caller }) func claimAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    switch (adminPrincipal) {
      case (?_) { false };
      case (null) {
        adminPrincipal := ?caller;
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
        true;
      };
    };
  };

  public query func isAdminClaimed() : async Bool {
    switch (adminPrincipal) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // Create a report - immediately approved, no review needed
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
      status = #approved;  // Immediately public, no review step
      photo;
    };

    reports.add(id, report);
    reportId += 1;
    report;
  };

  // Get a report by ID (public)
  public query func getReport(id : Nat) : async ?Report {
    reports.get(id);
  };

  // Get all approved reports (public)
  public query func getApprovedReports() : async [Report] {
    reports.values().filter(func(report) { report.status == #approved }).toArray();
  };

  // Get all reports (public - admin removed)
  public query func getAllReports() : async [Report] {
    reports.values().toArray();
  };

  // Get all pending reports
  public query func getPendingReports() : async [Report] {
    reports.values().filter(func(report) { report.status == #pending }).toArray();
  };

  // Approve a report
  public shared ({ caller }) func approveReport(id : Nat) : async () {
    switch (reports.get(id)) {
      case (?report) {
        let updatedReport : Report = { report with status = #approved };
        reports.add(id, updatedReport);
      };
      case (null) { Runtime.trap("Report does not exist") };
    };
  };

  // Reject a report
  public shared ({ caller }) func rejectReport(id : Nat) : async () {
    switch (reports.get(id)) {
      case (?report) {
        let updatedReport : Report = { report with status = #rejected };
        reports.add(id, updatedReport);
      };
      case (null) { Runtime.trap("Report does not exist") };
    };
  };
};
