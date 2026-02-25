import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentsManager from './pages/StudentsManager';
import { AdminsManager, TeachersManager } from './pages/UserManager';
import SubjectManager from './pages/SubjectManager';
import { TeacherDashboard, CGPAManager, AttendanceManager, MarksManager, AttendanceHistory } from './pages/TeacherPages';
import { StudentDashboard, StudentAttendance, StudentFees, StudentCGPA, StudentProfile, StudentMarks } from './pages/StudentPages';
import { AdminAttendanceView, AdminFeesView } from './pages/AdminViews';
import { LoadingScreen } from './components/UI';
import { NoticeBoard, StudentAssignments, TeacherAssignments, CourseResources } from './components/LMSComponents';

const getDefaultTab = (role) => {
    if (role === 'student') return 'student-dashboard';
    if (role === 'teacher') return 'teacher-dashboard';
    return 'dashboard';
};

const App = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState(null);

    if (loading) return <LoadingScreen message="Loading University Portal..." />;
    if (!user) return <LoginPage />;

    const currentTab = activeTab || getDefaultTab(user.role);

    const pageTitles = {
        'dashboard': { title: 'Admin Dashboard', sub: 'Overview of university metrics' },
        'students': { title: 'Students Hub', sub: 'Admission and student profile management' },
        'admins': { title: 'System Admins', sub: 'Control panel for administrator accounts' },
        'teachers': { title: 'Faculty Members', sub: 'Manage department faculty and staff' },
        'admin-subjects': { title: 'Subject Inventory', sub: 'Curriculum and course management' },
        'admin-attendance': { title: 'Attendance Audit', sub: 'Detailed attendance tracking reports' },
        'admin-fees': { title: 'Financial Ledger', sub: 'Fee collection and payment tracking' },

        'teacher-dashboard': { title: 'Faculty Dashboard', sub: 'Academic summary and quick actions' },
        'teacher-students': { title: 'Assigned Students', sub: 'Active students in your department' },
        'teacher-attendance': { title: 'Attendance Log', sub: 'Mark daily student attendance' },
        'teacher-attendance-history': { title: 'Attendance Records', sub: 'Review previously marked daily logs' },
        'teacher-marks': { title: 'Subject Marks', sub: 'Calculate and post subject results' },
        'teacher-cgpa': { title: 'Academic Performance', sub: 'Official CGPA and grade updates' },

        'lms-notices': { title: 'Notice Board', sub: 'Broadcast and stay updated with latest news' },
        'lms-assignments': { title: 'Assignment Hub', sub: 'Draft, publish and grade course assignments' },
        'lms-resources': { title: 'Learning Assets', sub: 'Repository of course documents and videos' },

        'student-dashboard': { title: 'Student Portal', sub: 'Your personalized academic overview' },
        'student-cgpa': { title: 'My Performance', sub: 'Overall grade point average and standing' },
        'student-marks': { title: 'Subject Results', sub: 'Detailed breakdown of marks per subject' },
        'student-attendance': { title: 'Attendance Report', sub: 'Track your presence in classes' },
        'student-fees': { title: 'Accounts & Fees', sub: 'Personal payment history and dues' },
        'student-profile': { title: 'My Settings', sub: 'Update security and personal info' },
        'lms-assignments-list': { title: 'My Assignments', sub: 'Pending tasks and graded submissions' },
        'lms-resources-list': { title: 'Study Center', sub: 'Download materials shared by your teachers' },
    };

    const renderPage = () => {
        switch (currentTab) {
            // Admin pages
            case 'dashboard': return <AdminDashboard />;
            case 'students': return <StudentsManager />;
            case 'admins': return <AdminsManager />;
            case 'teachers': return <TeachersManager />;
            case 'admin-subjects': return <SubjectManager />;
            case 'admin-attendance': return <AdminAttendanceView />;
            case 'admin-fees': return <AdminFeesView />;
            case 'admin-notices': return <NoticeBoard userRole="admin" />;

            // Teacher pages
            case 'teacher-dashboard': return <TeacherDashboard />;
            case 'teacher-students': return <StudentsManager readOnly />;
            case 'teacher-attendance': return <AttendanceManager />;
            case 'teacher-attendance-history': return <AttendanceHistory />;
            case 'teacher-marks': return <MarksManager />;
            case 'teacher-cgpa': return <CGPAManager />;
            case 'lms-notices': return <NoticeBoard userRole="teacher" />;
            case 'lms-assignments': return <TeacherAssignments />;
            case 'lms-resources': return <CourseResources userRole="teacher" />;

            // Student pages
            case 'student-dashboard': return <StudentDashboard />;
            case 'student-cgpa': return <StudentCGPA />;
            case 'student-marks': return <StudentMarks />;
            case 'student-attendance': return <StudentAttendance />;
            case 'student-fees': return <StudentFees />;
            case 'student-profile': return <StudentProfile />;
            case 'lms-assignments-list': return <StudentAssignments />;
            case 'lms-resources-list': return <CourseResources userRole="student" />;

            // Shared (handled inside components)
            case 'lms-notices-shared': return <NoticeBoard userRole={user.role} />;

            default: return <AdminDashboard />;
        }
    };

    const info = pageTitles[currentTab] || pageTitles['dashboard'];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="app-layout">
            <Sidebar activeTab={currentTab} onTabChange={handleTabChange} />
            <div className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <h2 style={{ letterSpacing: '-0.02em', fontSize: '24px' }}>{info.title}</h2>
                        <p style={{ fontWeight: 500, opacity: 0.7 }}>{info.sub}</p>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-time" style={{ letterSpacing: '0.05em', fontWeight: 600 }}>{dateStr} <span style={{ opacity: 0.3, margin: '0 8px' }}>|</span> {timeStr}</div>
                        <div className="topbar-user" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 16px', borderRadius: '14px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center' }}>
                            <span className="dot" style={{ background: 'var(--success)', width: 8, height: 8, borderRadius: '50%', marginRight: 12, boxShadow: '0 0 10px var(--success)' }}></span>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</span>
                            <span className="role-chip" style={{
                                marginLeft: 16,
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                padding: '4px 12px',
                                borderRadius: 8,
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#fff',
                                letterSpacing: '0.05em',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}>{user.role}</span>
                        </div>
                    </div>
                </header>
                <main className="page-content">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
