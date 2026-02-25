import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter } from '../components/LMSComponents';
import { addToast } from '../components/UI';

export const StudentDashboard = () => {
    const { apiFetch, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/student/profile').then(d => {
            if (d.success) setProfile(d.student);
            setLoading(false);
        });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;
    if (!profile) return <div className="alert alert-error">Could not load your profile.</div>;

    const cgpaPct = (profile.cgpa / 4) * 100;
    const attColor = profile.attendancePercentage >= 75 ? 'var(--success)' : profile.attendancePercentage >= 60 ? 'var(--warning)' : 'var(--danger)';
    const cgpaColor = profile.cgpa >= 3.5 ? 'var(--success)' : profile.cgpa >= 2.5 ? 'var(--warning)' : 'var(--danger)';
    const feeProgress = Math.min(100, Math.round(((profile.feePaid || 0) / (profile.feeAmount || 1)) * 100));

    return (
        <div>
            <div style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.1))',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 32px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(108,99,255,0.15), transparent)', borderRadius: '50%' }} />
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Welcome back</div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span>ID {profile.studentId}</span>
                        <span>Department {profile.department}</span>
                        <span>Semester {profile.semester}</span>
                        <span>Batch {profile.batch || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-title" style={{ textAlign: 'left' }}>Grade Point Average</div>
                            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 12px' }}>
                                <svg width="90" height="90" viewBox="0 0 110 110">
                                    <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                                    <circle
                                        cx="55" cy="55" r="48"
                                        fill="none"
                                        stroke={cgpaColor}
                                        strokeWidth="10"
                                        strokeDasharray={`${(cgpaPct / 100) * 301.6} 301.6`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 55 55)"
                                        style={{ filter: `drop-shadow(0 0 6px ${cgpaColor})` }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: cgpaColor }}>{Number(profile.cgpa).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="card-title" style={{ textAlign: 'left' }}>Attendance</div>
                            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 12px' }}>
                                <svg width="90" height="90" viewBox="0 0 110 110">
                                    <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                                    <circle
                                        cx="55" cy="55" r="48"
                                        fill="none"
                                        stroke={attColor}
                                        strokeWidth="10"
                                        strokeDasharray={`${(profile.attendancePercentage / 100) * 301.6} 301.6`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 55 55)"
                                        style={{ filter: `drop-shadow(0 0 6px ${attColor})` }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: attColor }}>{profile.attendancePercentage}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-title">Fee Status</div>
                            <div style={{ textAlign: 'center', marginBottom: 12 }}>
                                <span className={`badge badge-${profile.feeStatus === 'paid' ? 'paid' : profile.feeStatus === 'partial' ? 'partial' : 'unpaid'}`} style={{ fontSize: 11 }}>
                                    {profile.feeStatus?.toUpperCase()}
                                </span>
                            </div>
                            <div className="progress-bar-wrap" style={{ height: 6 }}>
                                <div className="progress-bar green" style={{ width: `${feeProgress}%` }} />
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{feeProgress}% paid</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title">Academic Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                            {[
                                { label: 'Full Name', value: user?.name },
                                { label: 'Email', value: user?.email },
                                { label: 'Student ID', value: profile.studentId },
                                { label: 'Department', value: profile.department },
                                { label: 'Semester', value: `Semester ${profile.semester}` },
                                { label: 'Batch', value: profile.batch || 'N/A' },
                            ].map(item => (
                                <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12, border: '1px solid var(--border-light)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value || 'None'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <NotificationCenter />
                </div>
            </div>
        </div>
    );
};

export const StudentAttendance = () => {
    const { apiFetch } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/student/attendance').then(d => { if (d.success) setData(d); setLoading(false); });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;
    if (!data) return <div className="alert alert-error">Could not load attendance</div>;

    const bySubject = {};
    data.records.forEach(r => {
        if (!bySubject[r.subject]) bySubject[r.subject] = { present: 0, absent: 0, leave: 0 };
        bySubject[r.subject][r.status]++;
    });

    const statusColor = { present: 'paid', absent: 'unpaid', leave: 'leave' };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                    { label: 'Overall %', value: `${data.percentage}%`, color: data.percentage >= 75 ? 'var(--success)' : 'var(--danger)' },
                    { label: 'Classes Present', value: data.classesAttended, color: 'var(--success)' },
                    { label: 'Classes Absent', value: data.totalClasses - data.classesAttended, color: 'var(--danger)' },
                    { label: 'Total Classes', value: data.totalClasses, color: 'var(--text-primary)' },
                ].map(s => (
                    <div key={s.label} className="stat-card purple">
                        <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {Object.keys(bySubject).length > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-title">Subject-wise Attendance</div>
                    {Object.entries(bySubject).map(([sub, counts]) => {
                        const total = counts.present + counts.absent + counts.leave;
                        const pct = total > 0 ? Math.round((counts.present / total) * 100) : 0;
                        return (
                            <div key={sub} style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                                    <span style={{ fontWeight: 600 }}>{sub}</span>
                                    <span style={{ color: pct >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div className="progress-bar-wrap">
                                    <div className={`progress-bar ${pct >= 75 ? 'green' : pct >= 60 ? 'orange' : 'red'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                                    {counts.present} Present · {counts.absent} Absent · {counts.leave} Leave
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="table-container">
                <div className="table-header"><h3>Recent Attendance Logs</h3></div>
                {data.records.length === 0 ? (
                    <div className="empty-state"><h4>No attendance logs found</h4></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Marked By</th></tr></thead>
                        <tbody>
                            {data.records.map(r => (
                                <tr key={r._id}>
                                    <td style={{ fontSize: 13 }}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 500 }}>{r.subject}</td>
                                    <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.markedBy?.name || 'Academic System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export const StudentMarks = () => {
    const { apiFetch } = useAuth();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/student/grades').then(d => {
            if (d.success) setGrades(d.grades);
            setLoading(false);
        });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;

    return (
        <div className="table-container">
            <div className="table-header">
                <h3>Semester Academic Results</h3>
            </div>
            {grades.length === 0 ? (
                <div className="empty-state">
                    <h4>No results available yet</h4>
                    <p>Marks will appear here once released by your teachers</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr><th>Subject</th><th>Code</th><th>Credits</th><th>Semester</th><th>Marks</th><th>Grade</th><th>Teacher</th></tr>
                    </thead>
                    <tbody>
                        {grades.map(g => (
                            <tr key={g._id}>
                                <td style={{ fontWeight: 600 }}>{g.subject?.name}</td>
                                <td><code style={{ fontSize: 11 }}>{g.subject?.code}</code></td>
                                <td style={{ textAlign: 'center' }}>{g.subject?.credits}</td>
                                <td style={{ textAlign: 'center' }}>S{g.semester}</td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.marks}</td>
                                <td>
                                    <span className={`badge badge-${g.marks >= 80 ? 'paid' : g.marks >= 60 ? 'partial' : 'unpaid'}`}>
                                        {g.grade}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12 }}>{g.teacher?.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export const StudentFees = () => {
    const { apiFetch } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/student/fees').then(d => { if (d.success) setData(d); setLoading(false); });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;
    if (!data) return <div className="alert alert-error">Could not load fee data</div>;

    const feeProgress = Math.min(100, Math.round(((data.feePaid || 0) / (data.feeAmount || 1)) * 100));

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                    { label: 'Total Payable', value: `PKR ${(data.feeAmount || 0).toLocaleString()}`, cls: 'purple' },
                    { label: 'Total Paid', value: `PKR ${(data.feePaid || 0).toLocaleString()}`, cls: 'green' },
                    { label: 'Balance Due', value: `PKR ${(data.feeBalance || 0).toLocaleString()}`, cls: data.feeBalance > 0 ? 'red' : 'green' },
                    { label: 'Paid %', value: `${feeProgress}%`, cls: 'blue' }
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-card-value" style={{ fontSize: 20 }}>{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="table-container">
                <div className="table-header"><h3>Receipt History</h3></div>
                {(!data.payments || data.payments.length === 0) ? (
                    <div className="empty-state">
                        <h4>No transactions found</h4>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Receipt No.</th><th>Date</th><th>Sem.</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {data.payments.map(p => (
                                <tr key={p._id}>
                                    <td><code style={{ fontSize: 11 }}>{p.receiptNo}</code></td>
                                    <td style={{ fontSize: 13 }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'center' }}>S{p.semester}</td>
                                    <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{p.paymentMethod}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>PKR {(p.amount || 0).toLocaleString()}</td>
                                    <td><span className="badge badge-paid">Paid</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export const StudentCGPA = () => {
    const { apiFetch } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/student/profile').then(d => { if (d.success) setProfile(d.student); setLoading(false); });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;
    if (!profile) return <div className="alert alert-error">Could not load academic profile</div>;

    const cgpa = Number(profile.cgpa);
    const cgpaPct = (cgpa / 4) * 100;
    const cgpaColor = cgpa >= 3.5 ? 'var(--success)' : cgpa >= 2.5 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 24 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title">Academic Standing</div>
                    <div style={{ position: 'relative', width: 160, height: 160, margin: '24px auto' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
                            <circle
                                cx="80" cy="80" r="70"
                                fill="none"
                                stroke={cgpaColor}
                                strokeWidth="14"
                                strokeDasharray={`${(cgpaPct / 100) * 439.8} 439.8`}
                                strokeLinecap="round"
                                transform="rotate(-90 80 80)"
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 40, fontWeight: 900, color: cgpaColor, lineHeight: 1 }}>{cgpa.toFixed(2)}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>GPA</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Grade Distribution (System Reference)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            { g: 'A+', p: '4.0', l: 'Excellent' },
                            { g: 'A', p: '4.0', l: 'Excellent' },
                            { g: 'B+', p: '3.3', l: 'Good' },
                            { g: 'B', p: '3.0', l: 'Good' },
                            { g: 'C+', p: '2.3', l: 'Average' },
                            { g: 'C', p: '2.0', l: 'Average' },
                        ].map(item => (
                            <div key={item.g} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                                <span style={{ fontWeight: 700 }}>{item.g}</span>
                                <span style={{ color: 'var(--primary-light)' }}>{item.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StudentProfile = () => {
    const { apiFetch, user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [changePwForm, setChangePwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiFetch('/student/profile').then(d => { if (d.success) setProfile(d.student); });
    }, [apiFetch]);

    const handleChangePassword = async () => {
        if (!changePwForm.currentPassword || !changePwForm.newPassword) return;
        if (changePwForm.newPassword !== changePwForm.confirm) {
            return addToast('Passwords do not match!', 'error');
        }
        setSaving(true);
        const d = await apiFetch('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword: changePwForm.currentPassword, newPassword: changePwForm.newPassword })
        });
        if (d.success) {
            addToast('Password changed successfully!', 'success');
            logout();
        } else { addToast(d.message, 'error'); }
        setSaving(false);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card">
                <div className="card-title">Student Details</div>
                {profile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Full Name', value: user?.name },
                            { label: 'System ID', value: profile.studentId },
                            { label: 'Department', value: profile.department },
                            { label: 'Semester', value: profile.semester },
                            { label: 'Enrolled Year', value: new Date(profile.enrollmentDate).getFullYear() },
                        ].map(f => (
                            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
                                <span style={{ fontWeight: 600 }}>{f.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="card">
                <div className="card-title">Security Settings</div>
                <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" value={changePwForm.currentPassword} onChange={e => setChangePwForm({ ...changePwForm, currentPassword: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={changePwForm.newPassword} onChange={e => setChangePwForm({ ...changePwForm, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={changePwForm.confirm} onChange={e => setChangePwForm({ ...changePwForm, confirm: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-block" onClick={handleChangePassword} disabled={saving}>
                    {saving ? 'Processing...' : 'Apply New Password'}
                </button>
            </div>
        </div>
    );
};
