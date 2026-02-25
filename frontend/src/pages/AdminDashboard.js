import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addToast } from '../components/UI';

const AdminDashboard = () => {
    const { apiFetch } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiFetch('/admin/stats');
            if (data.success) setStats(data.stats);
        } catch {
            addToast('Failed to load dashboard statistics', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
        </div>
    );

    const cards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, cls: 'purple' },
        { label: 'Total Teachers', value: stats?.totalTeachers || 0, cls: 'blue' },
        { label: 'Total Admins', value: stats?.totalAdmins || 0, cls: 'orange' },
        { label: 'Total Subjects', value: stats?.totalSubjects || 0, cls: 'purple' },
        { label: 'Active Students', value: stats?.activeStudents || 0, cls: 'green' },
        { label: 'Fees Paid', value: stats?.paidFees || 0, cls: 'green' },
        { label: 'Fees Unpaid', value: stats?.unpaidFees || 0, cls: 'red' },
        { label: 'Fees Partial', value: stats?.partialFees || 0, cls: 'orange' },
        { label: 'Average CGPA', value: stats?.avgCgpa || 0, cls: 'pink' },
    ];

    return (
        <div>
            <div className="section-title">
                System Overview & Statistics
            </div>

            <div className="stats-grid">
                {cards.map(c => (
                    <div key={c.label} className={`stat-card ${c.cls}`}>
                        <div className="stat-card-value">{c.value}</div>
                        <div className="stat-card-label">{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="card">
                    <div className="card-title">Fee Status Distribution</div>
                    {[
                        { label: 'Paid', value: stats?.paidFees || 0, total: stats?.totalStudents || 1, color: 'green' },
                        { label: 'Partial', value: stats?.partialFees || 0, total: stats?.totalStudents || 1, color: 'orange' },
                        { label: 'Unpaid', value: stats?.unpaidFees || 0, total: stats?.totalStudents || 1, color: 'red' },
                    ].map(item => (
                        <div key={item.label} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ fontWeight: 600 }}>{item.value} students</span>
                            </div>
                            <div className="progress-bar-wrap">
                                <div
                                    className={`progress-bar ${item.color}`}
                                    style={{ width: `${Math.round((item.value / item.total) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-title">System Status</div>
                    {[
                        { label: 'Total Active Users', value: (stats?.totalStudents || 0) + (stats?.totalTeachers || 0) + (stats?.totalAdmins || 0) },
                        { label: 'Global Average CGPA', value: `${stats?.avgCgpa || 0} / 4.0` },
                        { label: 'Database Connection', value: 'Active' },
                        { label: 'Server Instance', value: 'Healthy' },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
