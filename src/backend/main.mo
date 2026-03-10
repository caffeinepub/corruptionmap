import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";

actor {
  // Report Type + Comparison Module
  type Report = {
    id : Nat;
    city : Text;
    amount : Nat;
    department : Text;
    description : Text;
    created_at : Int;
    corruption_type : Text;
  };

  module Report {
    public func compareByNewest(r1 : Report, r2 : Report) : Order.Order {
      Int.compare(r2.created_at, r1.created_at);
    };
  };

  // Persistent Data Structures
  var reportId = 0;
  let reports = Map.empty<Nat, Report>();

  // Component Functions
  public shared ({ caller }) func submitReport(department : Text, city : Text, corruptionType : Text, amount : Nat, description : Text) : async Report {
    let id = reportId;
    let report : Report = {
      id;
      city;
      amount;
      department;
      description;
      corruption_type = corruptionType;
      created_at = Time.now();
    };

    reports.add(id, report);
    reportId += 1;
    report;
  };

  public query ({ caller }) func getReports() : async [Report] {
    reports.values().toArray().sort(Report.compareByNewest);
  };

  public query ({ caller }) func getReport(id : Nat) : async Report {
    switch (reports.get(id)) {
      case (?report) { report };
      case (null) { Runtime.trap("Report does not exist!") };
    };
  };
};
