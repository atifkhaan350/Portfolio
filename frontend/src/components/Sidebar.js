import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, onTabChange }) => {
    const { user, logout } = useAuth();

    const adminNav = [
        {
            section: 'Overview',
            items: [
                { id: 'dashboard', icon: '', label: 'Dashboard' },
            ]
        },
        {
            section: 'Management',
            items: [
                { id: 'students', icon: '', label: 'Students' },
                { id: 'teachers', icon: '', label: 'Teachers' },
                { id: 'admins', icon: '', label: 'Admins' },
            ]
        },
        {
            section: 'Academic',
            items: [
                { id: 'admin-subjects', icon: '', label: 'Subjects' },
                { id: 'admin-attendance', icon: '', label: 'Attendance' },
                { id: 'admin-fees', icon: '', label: 'Fee Payments' },
                { id: 'admin-notices', icon: '', label: 'LMS Notices' },
            ]
        },
    ];

    const teacherNav = [
        {
            section: 'Overview',
            items: [
                { id: 'teacher-dashboard', icon: '', label: 'Dashboard' },
                { id: 'lms-notices', icon: '', label: 'Notice Board' },
            ]
        },
        {
            section: 'Academic',
            items: [
                { id: 'teacher-students', icon: '', label: 'My Students' },
                { id: 'teacher-attendance', icon: '', label: 'Mark Attendance' },
                { id: 'teacher-attendance-history', icon: '', label: 'Attendance History' },
                { id: 'teacher-marks', icon: '', label: 'Student Marks' },
                { id: 'teacher-cgpa', icon: '', label: 'Update CGPA' },
            ]
        },
        {
            section: 'LMS',
            items: [
                { id: 'lms-assignments', icon: '', label: 'Assignments' },
                { id: 'lms-resources', icon: '', label: 'Course Materials' },
            ]
        }
    ];

    const studentNav = [
        {
            section: 'My Portal',
            items: [
                { id: 'student-dashboard', icon: '', label: 'Dashboard' },
                { id: 'lms-notices', icon: '', label: 'Notice Board' },
            ]
        },
        {
            section: 'Academic',
            items: [
                { id: 'student-cgpa', icon: '', label: 'My CGPA' },
                { id: 'student-marks', icon: '', label: 'Subject Results' },
                { id: 'student-attendance', icon: '', label: 'Attendance' },
            ]
        },
        {
            section: 'LMS',
            items: [
                { id: 'lms-assignments-list', icon: '', label: 'Assignments' },
                { id: 'lms-resources-list', icon: '', label: 'Materials' },
                { id: 'student-fees', icon: '', label: 'Fee Payment' },
            ]
        },
        {
            section: 'Other',
            items: [
                { id: 'student-profile', icon: '', label: 'Profile' },
            ]
        }
    ];

    const getNavItems = () => {
        if (user?.role === 'student') return studentNav;
        if (user?.role === 'teacher') return teacherNav;
        return adminNav;
    };

    const roleBadgeClass = `badge-${user?.role === 'superadmin' ? 'superadmin' : user?.role}`;
    const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-text">
                    <h2>UniPortal</h2>
                    <span>Management System</span>
                </div>
            </div>

            <div className="sidebar-user">
                <div className="sidebar-user-card">
                    <div className="sidebar-user-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <h4>{user?.name?.split(' ')[0] || 'User'}</h4>
                        <span>{user?.userId || user?.role}</span>
                    </div>
                    <span className={`sidebar-user-badge ${roleBadgeClass}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {getNavItems().map(section => (
                    <div key={section.section} className="sidebar-nav-section">
                        <div className="sidebar-nav-label">{section.section}</div>
                        {section.items.map(item => (
                            <div
                                key={item.id}
                                className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => onTabChange(item.id)}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-logout" onClick={logout}>
                    Sign Out
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
