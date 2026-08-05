import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout.jsx";
import { DashboardPage } from "./sections/dashboard/DashboardPage.jsx";
import { UsersPage } from "./sections/users/UsersPage.jsx";
import { UserDetailPage } from "./sections/user-detail/UserDetailPage.jsx";
import { AdministratorsPage } from "./sections/administrators/AdministratorsPage.jsx";
import { PlansPage } from "./sections/plans/PlansPage.jsx";
import { OcrPage } from "./sections/ocr/OcrPage.jsx";
import { StatisticsPage } from "./sections/statistics/StatisticsPage.jsx";
import { AuditPage } from "./sections/audit/AuditPage.jsx";
import { SettingsPage } from "./sections/settings/SettingsPage.jsx";

export default function AdminApp() {
  return <Routes><Route element={<AdminLayout />}><Route index element={<DashboardPage />} /><Route path="usuarios" element={<UsersPage />} /><Route path="usuarios/:uid" element={<UserDetailPage />} /><Route path="administradores" element={<AdministratorsPage />} /><Route path="planes" element={<PlansPage />} /><Route path="ocr" element={<OcrPage />} /><Route path="estadisticas" element={<StatisticsPage />} /><Route path="auditoria" element={<AuditPage />} /><Route path="configuracion" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/admin" replace />} /></Route></Routes>;
}
