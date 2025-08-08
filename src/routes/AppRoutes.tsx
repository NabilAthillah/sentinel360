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
import HomePage from '../pages/user/home/HomePage';
import MapPage from '../pages/site/MapPage';
import SitePage from '../pages/site/SitePage';
import RoutePage from '../pages/site/RoutePage';
import Attendance from '../pages/user/Attendance/Attendance';
import Checkin from '../pages/user/Attendance/Checkin';
import Leaves from '../pages/user/Leaves/Leaves';
import RequestLeaves from '../pages/user/Leaves/RequestLeaves';
import Settings from '../pages/user/Settings/Settings';
import Profile from '../pages/user/Settings/Profile';
import ChangePassword from '../pages/user/Settings/ChangePassword';
import Incident from '../pages/user/Incident/Incident';
import Report from '../pages/user/Incident/Report';
import History from '../pages/user/Incident/History';
import Occurence from '../pages/user/Occurrence/Occurence';
import ReportOccurance from '../pages/user/Occurrence/ReportOccurance';
import EditOccurance from '../pages/user/Occurrence/EditOccurance';
import HistoryOccurance from '../pages/user/Occurrence/HistoryOccurance';
import Clocking from '../pages/user/Clocking/Clocking';
import ScanClocking from '../pages/user/Clocking/ScanClocking';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/employees' element={<EmployeesPage />} />
        <Route path='/attendance' element={<AttendancePage />} />
        <Route path='/e-occurrence' element={<OccurencePage />} />
        <Route path='/e-learning' element={<LearningPage />} />
        <Route path='/e-learning/history' element={<HistoryPage />} />
        <Route path='/incidents' element={< IncidentTypePage />} />
        <Route path='/leave-management' element={<LeaveManagementPage />} />
        <Route path='/sites' element={<SitePage />} />
        <Route path='/sites/map' element={<MapPage />} />
        <Route path='/sites/allocation' element={<AllocationPage />} />
        <Route path='/sites/:idSite/routes' element={<RoutePage />} />
        <Route path='/settings/attendance' element={<SettingsAttendancePage />} />
        <Route path='/settings/client-info' element={<ClientInfoPage />} />
        <Route path='/settings/employee-document' element={<EmployeeDocumentPage />} />
        <Route path='/settings/incident' element={<IncidentPageMaster />} />
        <Route path='/settings/occurrence-catg' element={<OccurrenceCatgPage />} />
        <Route path='/settings/roles' element={<RolesPage />} />
        <Route path='/settings/sop-document' element={<SopDocumentPage />} />
        <Route path='/settings/profile' element={<ProfilePage />} />
        <Route path='/incidentfree' element={< IncidentPage />} />
        <Route path='/pre-employees' element={< PreEmployeePage />} />
        <Route path='/audit-trails' element={< AuditTrails />} />

        <Route path='/user' element={<HomePage />} />
        <Route path='/user/clocking' element={<Clocking />} />
        <Route path='/user/clocking/scan' element={<ScanClocking />} />
        <Route path='/user/e-occurence' element={<Occurence/>} />
        <Route path='/user/e-occurence/report' element={<ReportOccurance/>} />
        <Route path='/user/e-occurence/report/edit' element={<EditOccurance/>} />
        <Route path='/user/e-occurence/history' element={<HistoryOccurance/>} />
        <Route path='/user/incident' element={<Incident />} />
        <Route path='/user/incident/report' element={<Report />} />
        <Route path='/user/incident/history' element={<History />} />
        <Route path='/user/attendance' element={<Attendance/>} />
        <Route path='/user/attendance/checkin' element={<Checkin/>} />
        <Route path='/user/leaves' element={<Leaves/>} />
        <Route path='/user/leaves/request' element={<RequestLeaves/>} />
        <Route path='/user/settings' element={<Settings/>} />
        <Route path='/user/settings/profile' element={<Profile/>} />
        <Route path='/user/settings/change-password' element={<ChangePassword/>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes