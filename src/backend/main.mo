import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";

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

  // Claim admin: only works if no admin has been assigned yet
  public shared ({ caller }) func claimAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (accessControlState.adminAssigned) {
      return false;
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  // Check if admin has been claimed yet (public)
  public query func isAdminClaimed() : async Bool {
    accessControlState.adminAssigned;
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
        if (report.status != #approved and not AccessControl.isAdmin(accessControlState, caller)) {
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get all reports");
    };
    reports.values().toArray();
  };

  // Get all pending reports (admin only)
  public query ({ caller }) func getPendingReports() : async [Report] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get all pending reports");
    };
    reports.values().filter(func(report) { report.status == #pending }).toArray();
  };

  // Approve a report (admin only)
  public shared ({ caller }) func approveReport(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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
