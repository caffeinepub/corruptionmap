import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Report {
    id: bigint;
    city: string;
    description: string;
    created_at: bigint;
    corruption_type: string;
    department: string;
    amount: bigint;
}
export interface backendInterface {
    getReport(id: bigint): Promise<Report>;
    getReports(): Promise<Array<Report>>;
    submitReport(department: string, city: string, corruptionType: string, amount: bigint, description: string): Promise<Report>;
}
