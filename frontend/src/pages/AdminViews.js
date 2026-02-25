import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminAttendanceView = () => {
    const { apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pct, setPct] = useState(0);

    useEffect(() => {
        apiFetch('/admin/students').then(d => { if (d.success) setStudents(d.students); });
    }, [apiFetch]);

    const loadRecords = async (id) => {
        setSelectedId(id);
        if (!id) { setRecords([]); return; }
        setLoading(true);
        const d = await apiFetch(`/teacher/attendance/${id}`);
        if (d.success) { setRecords(d.records); setPct(d.percentage); }
        setLoading(false);
    };

    const statusColor = { present: 'paid', absent: 'unpaid', leave: 'leave' };
    const selectedSt = students.find(s => s._id === selectedId);

    return (
        <div>
            <div className="table-header" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 18, border: '1px solid var(--border)' }}>
                <h3>Attendance Records</h3>
                <select className="form-select" style={{ width: 280 }} value={selectedId} onChange={e => loadRecords(e.target.value)}>
                    <option value="">Select a student...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} — {s.studentId}</option>)}
                </select>
            </div>

            {selectedSt && (
                <div className="card" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="user-avatar" style={{ width: 52, height: 52, fontSize: 22 }}>{selectedSt.user?.name?.charAt(0)}</div>
                    <div>
                        <h4>{selectedSt.user?.name}</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedSt.studentId} · {selectedSt.department}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 75 ? 'var(--success)' : 'var(--danger)' }}>{pct}%</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Attendance</div>
                    </div>
                    <div style={{ width: 120 }}>
                        <div className="progress-bar-wrap"><div className={`progress-bar ${pct >= 75 ? 'green' : 'red'}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <div className="table-header"><h3>Records {records.length > 0 ? `(${records.length} entries)` : ''}</h3></div>
                {!selectedId ? (
                    <div className="empty-state"><h4>Select a student above</h4></div>
                ) : loading ? (
                    <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
                ) : records.length === 0 ? (
                    <div className="empty-state"><h4>No attendance records found</h4></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Marked By</th></tr></thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r._id}>
                                    <td>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 500 }}>{r.subject}</td>
                                    <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.markedBy?.name || 'System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export const AdminFeesView = () => {
    const { apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchStudents = useCallback(async () => {
        const d = await apiFetch('/admin/students');
        if (d.success) setStudents(d.students);
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const filtered = students.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || s.feeStatus === filter;
        return matchesSearch && matchesFilter;
    });

    const totalRevenue = students.reduce((a, s) => a + (s.feePaid || 0), 0);
    const totalPending = students.reduce((a, s) => a + Math.max(0, (s.feeAmount || 0) - (s.feePaid || 0)), 0);

    return (
        <div>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Collected', value: `PKR ${totalRevenue.toLocaleString()}`, cls: 'green' },
                    { label: 'Total Pending', value: `PKR ${totalPending.toLocaleString()}`, cls: 'red' },
                    { label: 'Fully Paid Count', value: students.filter(s => s.feeStatus === 'paid').length, cls: 'green' },
                    { label: 'Outstanding Balance Count', value: students.filter(s => s.feeStatus !== 'paid').length, cls: 'orange' },
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-card-value" style={{ fontSize: 20 }}>{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Fee Payment Overview</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="page-tabs" style={{ margin: 0 }}>
                            {['all', 'paid', 'partial', 'unpaid'].map(f => (
                                <button key={f} className={`page-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ padding: '7px 14px', textTransform: 'capitalize' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                {loading ? <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div> : (
                    <table className="data-table">
                        <thead>
                            <tr><th>Student</th><th>Total Fee</th><th>Paid</th><th>Balance</th><th>Progress</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => {
                                const pct = Math.min(100, Math.round(((s.feePaid || 0) / (s.feeAmount || 1)) * 100));
                                return (
                                    <tr key={s._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{s.user?.name?.charAt(0)}</div>
                                                <div><div className="user-name">{s.user?.name}</div><div className="user-id">{s.studentId}</div></div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>PKR {(s.feeAmount || 0).toLocaleString()}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>PKR {(s.feePaid || 0).toLocaleString()}</td>
                                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>PKR {Math.max(0, (s.feeAmount || 0) - (s.feePaid || 0)).toLocaleString()}</td>
                                        <td style={{ minWidth: 120 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="progress-bar-wrap" style={{ flex: 1, height: 6 }}>
                                                    <div className={`progress-bar ${pct === 100 ? 'green' : pct > 0 ? 'orange' : 'red'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span style={{ fontSize: 11, minWidth: 30 }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-${s.feeStatus === 'paid' ? 'paid' : s.feeStatus === 'partial' ? 'partial' : 'unpaid'}`}>{s.feeStatus}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
