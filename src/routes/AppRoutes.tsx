import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AttendancePage from '../pages/attendance/AttendancePage';
import AuditTrails from '../pages/auditTrails/AuditTrails';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmployeesPage from '../pages/employees/EmployeesPage';
import IncidentTypePage from '../pages/incident/IncidentPage';
import IncidentPage from '../pages/incidentType/IncidentType';
import HistoryPage from '../pages/learning/HistoryPage';
import LearningPage from '../pages/learning/LearningPage';
import LeaveManagementPage from '../pages/leaveManagement/LeaveManagementPage';
import OccurencePage from '../pages/occurence/OccurencePage';
import PreEmployeePage from '../pages/preEmployee/PreEmployeePage';
import SettingsAttendancePage from '../pages/setings/attendance/SettingsAttendancePage';
import ClientInfoPage from '../pages/setings/client/ClientInfoPage';
import EmployeeDocumentPage from '../pages/setings/employeeDocument/EmployeeDocumentPage';
import IncidentPageMaster from '../pages/setings/incident/IncidentPage';
import OccurrenceCatgPage from '../pages/setings/occurrenceCatg/OccurrenceCatgPage';
import ProfilePage from '../pages/setings/profile/ProfilePage';
import RolesPage from '../pages/setings/roles/RolesPage';
import SopDocumentPage from '../pages/setings/sop-document/SopDocumentPage';
import AllocationPage from '../pages/site/AllocationPage';
import MapPage from '../pages/site/MapPage';
import RoutePage from '../pages/site/RoutePage';
import SitePage from '../pages/site/SitePage';
import Attendance from '../pages/user/Attendance/Attendance';
import Checkin from '../pages/user/Attendance/Checkin';
import Login from '../pages/user/Auth/Login';
import Clocking from '../pages/user/Clocking/Clocking';
import ScanClocking from '../pages/user/Clocking/ScanClocking';
import HomePage from '../pages/user/home/HomePage';
import History from '../pages/user/Incident/History';
import Incident from '../pages/user/Incident/Incident';
import Report from '../pages/user/Incident/Report';
import Leaves from '../pages/user/Leaves/Leaves';
import RequestLeaves from '../pages/user/Leaves/RequestLeaves';
import EditOccurance from '../pages/user/Occurrence/EditOccurance';
import HistoryOccurance from '../pages/user/Occurrence/HistoryOccurance';
import Occurence from '../pages/user/Occurrence/Occurence';
import ReportOccurance from '../pages/user/Occurrence/ReportOccurance';
import ChangePassword from '../pages/user/Settings/ChangePassword';
import Profile from '../pages/user/Settings/Profile';
import Settings from '../pages/user/Settings/Settings';
import ReportPage from '../pages/report/ReportPage';
import SopDocument from '../pages/user/SopDocument/SopDocument';
import EmployeeDocument from '../pages/user/EmployeDocument/EmployeeDocument';
import Contact from '../pages/user/Contact/Contact';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path='/auth/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/dashboard/report' element={<ReportPage />} />
        <Route path='/dashboard/employees' element={<EmployeesPage />} />
        <Route path='/dashboard/attendance' element={<AttendancePage />} />
        <Route path='/dashboard/e-occurrence' element={<OccurencePage />} />
        <Route path='/dashboard/e-learning' element={<LearningPage />} />
        <Route path='/dashboard/e-learning/history' element={<HistoryPage />} />
        <Route path='/dashboard/incidents' element={< IncidentTypePage />} />
        <Route path='/dashboard/leave-management' element={<LeaveManagementPage />} />
        <Route path='/dashboard/sites' element={<SitePage />} />
        <Route path='/dashboard/sites/map' element={<MapPage />} />
        <Route path='/dashboard/sites/allocation' element={<AllocationPage />} />
        <Route path='/dashboard/sites/:idSite/routes' element={<RoutePage />} />
        <Route path='/dashboard/settings/attendance' element={<SettingsAttendancePage />} />
        <Route path='/dashboard/settings/client-info' element={<ClientInfoPage />} />
        <Route path='/dashboard/settings/employee-document' element={<EmployeeDocumentPage />} />
        <Route path='/dashboard/settings/incident' element={<IncidentPageMaster />} />
        <Route path='/dashboard/settings/occurrence-catg' element={<OccurrenceCatgPage />} />
        <Route path='/dashboard/settings/roles' element={<RolesPage />} />
        <Route path='/dashboard/settings/sop-document' element={<SopDocumentPage />} />
        <Route path='/dashboard/settings/profile' element={<ProfilePage />} />
        <Route path='/dashboard/audit-trails' element={< AuditTrails />} />

        <Route path='/user' element={<HomePage />} />
        <Route path='/user/login' element={<Login />} />
        <Route path='/user/employee-document' element={<EmployeeDocument />} />
        <Route path='/user/contact' element={<Contact />} />
        <Route path='/user/sop-document' element={<SopDocument />} />
        <Route path='/user/clocking' element={<Clocking />} />
        <Route path='/user/clocking/scan' element={<ScanClocking />} />
        <Route path='/user/e-occurence' element={<Occurence />} />
        <Route path='/user/e-occurence/report' element={<ReportOccurance />} />
        <Route path='/user/e-occurence/report/edit' element={<EditOccurance />} />
        <Route path='/user/e-occurence/history' element={<HistoryOccurance />} />
        <Route path='/user/incident' element={<Incident />} />
        <Route path='/user/incident/report' element={<Report />} />
        <Route path='/user/incident/history' element={<History />} />
        <Route path='/user/attendance' element={<Attendance />} />
        <Route path='/user/attendance/checkin' element={<Checkin />} />
        <Route path='/user/leaves' element={<Leaves />} />
        <Route path='/user/leaves/request' element={<RequestLeaves />} />
        <Route path='/user/settings' element={<Settings />} />
        <Route path='/user/settings/profile' element={<Profile />} />
        <Route path='/user/settings/change-password' element={<ChangePassword />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes