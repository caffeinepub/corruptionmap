import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Report {
    id: bigint;
    status: ReportStatus;
    city: string;
    corruptionType: string;
    createdAt: bigint;
    officerName?: string;
    description: string;
    photo?: ExternalBlob;
    department: string;
    amount: bigint;
}
export enum ReportStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveReport(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<boolean>;
    isAdminClaimed(): Promise<boolean>;
    createReport(department: string, city: string, corruptionType: string, amount: bigint, description: string, officerName: string | null, photo: ExternalBlob | null): Promise<Report>;
    getAllReports(): Promise<Array<Report>>;
    getApprovedReports(): Promise<Array<Report>>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingReports(): Promise<Array<Report>>;
    getReport(id: bigint): Promise<Report | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectReport(id: bigint): Promise<void>;
}
