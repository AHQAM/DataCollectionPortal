import React from "react";
import { useUIStore } from "../../stores/uiStore";
import { useDataStore } from "../../stores/dataStore";
import { DashboardBanner } from "./dashboard/DashboardBanner";
import { KpiCardsGrid } from "./dashboard/KpiCardsGrid";
import { BranchProgress } from "./dashboard/BranchProgress";
import { CurrentCampaignsList } from "./dashboard/CurrentCampaignsList";
import { RecentAuditActivity } from "./dashboard/RecentAuditActivity";

interface Props {
  onNavigate: (module: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { lang } = useUIStore();
  const { requests, records, users, branches, auditLogs } = useDataStore();

  // Calculations
  const activeRequests = requests.filter(
    (r) => r.status === "Published",
  ).length;
  const draftRequests = requests.filter((r) => r.status === "Draft").length;

  const totalAssignedRecords = records.length;
  const completedRecords = records.filter(
    (r) => r.recordStatus === "Completed",
  ).length;
  const pendingRecords = records.filter(
    (r) => r.recordStatus === "Pending" || r.recordStatus === "DraftSaved",
  ).length;
  const overallPercentage =
    totalAssignedRecords > 0
      ? Math.round((completedRecords / totalAssignedRecords) * 100)
      : 0;

  const lockedUsersCount = users.filter(
    (u) => u.lockedUntil && new Date(u.lockedUntil) > new Date(),
  ).length;

  // Branch statistics
  const branchStats = branches.map((branch) => {
    const branchRecords = records.filter((r) => r.branchId === branch.branchId);
    const completed = branchRecords.filter(
      (r) => r.recordStatus === "Completed",
    ).length;
    const total = branchRecords.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      branch,
      total,
      completed,
      pct,
    };
  });

  return (
    <div className="space-y-6">
      <DashboardBanner lang={lang} onNavigate={onNavigate} />

      <KpiCardsGrid
        lang={lang}
        activeRequests={activeRequests}
        draftRequests={draftRequests}
        overallPercentage={overallPercentage}
        totalAssignedRecords={totalAssignedRecords}
        completedRecords={completedRecords}
        pendingRecords={pendingRecords}
        users={users}
        lockedUsersCount={lockedUsersCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BranchProgress
          lang={lang}
          onNavigate={onNavigate}
          branchStats={branchStats}
        />

        <CurrentCampaignsList
          lang={lang}
          onNavigate={onNavigate}
          requests={requests}
        />
      </div>

      <RecentAuditActivity
        lang={lang}
        onNavigate={onNavigate}
        auditLogs={auditLogs}
      />
    </div>
  );
};
