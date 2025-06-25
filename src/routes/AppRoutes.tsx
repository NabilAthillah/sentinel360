import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmployeesPage from '../pages/employees/EmployeesPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import OccurencePage from '../pages/occurence/OccurencePage';
import LearningPage from '../pages/learning/LearningPage';
import IncidentPage from '../pages/incident/IncidentPage';
import LeaveManagementPage from '../pages/leaveManagement/LeaveManagementPage';
import SettingsAttendancePage from '../pages/setings/attendance/SettingsAttendancePage';
import ClientInfoPage from '../pages/setings/client/ClientInfoPage';
import EmployeeDocumentPage from '../pages/setings/employeeDocument/EmployeeDocumentPage';
import OccurrenceCatgPage from '../pages/setings/occurrenceCatg/OccurrenceCatgPage';
import RolesPage from '../pages/setings/roles/RolesPage';
import SopDocumentPage from '../pages/setings/sop-document/SopDocumentPage';
import ProfilePage from '../pages/setings/profile/ProfilePage';
import HistoryPage from '../pages/learning/HistoryPage';
import SitePage from '../pages/site/SitePage';
import RoutePage from '../pages/site/RoutePage';

const AppRoutes = () => {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path='/login' element={<LoginPage />}/>
            <Route path='/dashboard' element={<DashboardPage />}/>
            <Route path='/employees' element={<EmployeesPage />}/>
            <Route path='/attendance' element={<AttendancePage />}/>
            <Route path='/e-occurrence' element={<OccurencePage />}/>
            <Route path='/e-learning' element={<LearningPage />}/>
            <Route path='/e-learning/history' element={<HistoryPage />}/>
            <Route path='/incidents' element={<IncidentPage />}/>
            <Route path='/leave-management' element={<LeaveManagementPage />}/>
            <Route path='/sites' element={<SitePage />}/>
            <Route path='/sites/:idSite/routes' element={<RoutePage />}/>
            <Route path='/settings/attendance' element={<SettingsAttendancePage />}/>
            <Route path='/settings/client-info' element={<ClientInfoPage />}/>
            <Route path='/settings/employee-document' element={<EmployeeDocumentPage />}/>
            <Route path='/settings/incident' element={<ClientInfoPage />}/>
            <Route path='/settings/occurrence-catg' element={<OccurrenceCatgPage />}/>
            <Route path='/settings/roles' element={<RolesPage />}/>
            <Route path='/settings/sop-document' element={<SopDocumentPage />}/>
            <Route path='/settings/profile' element={<ProfilePage />}/>
        </Routes>
    </Router>
  )
}

export default AppRoutes