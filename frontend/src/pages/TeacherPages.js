import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, addToast, useConfirm } from '../components/UI';

const StudentTable = ({ list }) => (
    <table className="data-table">
        <thead>
            <tr><th>Student</th><th>ID</th><th>CGPA</th><th>Attendance</th><th>Fee Status</th></tr>
        </thead>
        <tbody>
            {list.map(s => (
                <tr key={s._id}>
                    <td>
                        <div className="user-cell">
                            <div className="user-avatar">{s.user?.name?.charAt(0)}</div>
                            <div><div className="user-name">{s.user?.name}</div><div className="user-id">{s.studentId}</div></div>
                        </div>
                    </td>
                    <td style={{ fontSize: 13 }}><code style={{ color: 'var(--primary-light)' }}>{s.studentId}</code></td>
                    <td><span style={{ fontWeight: 700, color: s.cgpa >= 3.5 ? 'var(--success)' : s.cgpa >= 2.5 ? 'var(--warning)' : 'var(--danger)' }}>{Number(s.cgpa).toFixed(2)}</span></td>
                    <td><span style={{ fontSize: 13, color: s.attendancePercentage >= 75 ? 'var(--success)' : 'var(--warning)' }}>{s.attendancePercentage}%</span></td>
                    <td><span className={`badge badge-${s.feeStatus === 'paid' ? 'paid' : s.feeStatus === 'partial' ? 'partial' : 'unpaid'}`}>{s.feeStatus}</span></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const GroupedStudentView = ({ students, title }) => {
    const grouped = {};
    students.forEach(s => {
        if (!grouped[s.department]) grouped[s.department] = [];
        grouped[s.department].push(s);
    });

    return (
        <div className="table-container">
            <div className="table-header"><h3>{title}</h3></div>
            {Object.entries(grouped).map(([dept, list]) => (
                <div key={dept} style={{ marginBottom: 24 }}>
                    <div style={{
                        padding: '8px 16px', background: 'rgba(108,99,255,0.05)',
                        borderRadius: 8, marginBottom: 12, borderLeft: '4px solid var(--primary)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>{dept}</h4>
                        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>{list.length} STUDENTS</span>
                    </div>
                    <StudentTable list={list} />
                </div>
            ))}
            {students.length === 0 && <div className="empty-state"><h4>No students found in your department</h4></div>}
        </div>
    );
};

export const TeacherDashboard = () => {
    const { apiFetch, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch('/teacher/profile'),
            apiFetch('/teacher/students')
        ]).then(([profileData, studentData]) => {
            if (profileData.success) setProfile(profileData.teacher);
            if (studentData.success) setStudents(studentData.students);
            setLoading(false);
        });
    }, [apiFetch]);

    const stats = [
        { label: 'My Students', value: students.length, cls: 'purple' },
        { label: 'Avg CGPA', value: students.length ? (students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2) : '0.00', cls: 'green' },
        { label: 'Avg Attendance', value: students.length ? (students.reduce((a, s) => a + s.attendancePercentage, 0) / students.length).toFixed(1) + '%' : '0%', cls: 'blue' },
        { label: 'Paid Fees (Count)', value: students.filter(s => s.feeStatus === 'paid').length, cls: 'orange' },
    ];

    return (
        <div>
            <div style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,170,0.05))',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                padding: '24px 30px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Faculty Access</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>{user?.name}</h2>
                    {profile && (
                        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                            <span>Department: {profile.department}</span>
                            <span>Specialization: {profile.specialization}</span>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-admin" style={{ fontSize: 12, padding: '6px 14px' }}>University Faculty</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-card-value">{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {!loading && <GroupedStudentView students={students} title="Departmental Student Roster" />}
        </div>
    );
};

export const CGPAManager = () => {
    const { apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savingId, setSavingId] = useState(null);

    const fetchStudents = useCallback(async () => {
        const d = await apiFetch('/teacher/students');
        if (d.success) setStudents(d.students);
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleUpdate = async (studentId, val) => {
        if (!val || isNaN(val) || val < 0 || val > 4) return addToast('Enter valid CGPA (0.00 - 4.00)', 'error');
        setSavingId(studentId);
        try {
            const d = await apiFetch(`/teacher/update-cgpa/${studentId}`, {
                method: 'PUT', body: JSON.stringify({ cgpa: parseFloat(val) })
            });
            if (d.success) {
                addToast('CGPA updated', 'success');
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, cgpa: parseFloat(val) } : s));
            } else addToast(d.message, 'error');
        } catch { addToast('Server error', 'error'); }
        finally { setSavingId(null); }
    };

    const filtered = students.filter(s =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    // Grouping by department for CGPA manager
    const grouped = {};
    filtered.forEach(s => {
        if (!grouped[s.department]) grouped[s.department] = [];
        grouped[s.department].push(s);
    });

    return (
        <div>
            <div className="table-container">
                <div className="table-header">
                    <div><h3>Grade Point Management</h3><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Official CGPA updates for your students</p></div>
                    <div className="search-input-wrap">
                        <input className="search-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                {loading ? <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div> : (
                    Object.entries(grouped).map(([dept, list]) => (
                        <div key={dept} style={{ marginBottom: 30 }}>
                            <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: 6, marginBottom: 12, fontWeight: 700, fontSize: 13, borderLeft: '3px solid var(--primary)' }}>{dept}</div>
                            <table className="data-table">
                                <thead><tr><th>Student</th><th>ID</th><th>New CGPA</th><th>Status</th></tr></thead>
                                <tbody>
                                    {list.map(s => (
                                        <tr key={s._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">{s.user?.name?.charAt(0)}</div>
                                                    <div><div className="user-name">{s.user?.name}</div><div className="user-id">{s.user?.email}</div></div>
                                                </div>
                                            </td>
                                            <td><code>{s.studentId}</code></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <input type="number" step="0.01" min="0" max="4" className="form-input" style={{ width: 90 }} defaultValue={s.cgpa} onBlur={(e) => { if (parseFloat(e.target.value) !== s.cgpa) handleUpdate(s._id, e.target.value); }} />
                                                    {savingId === s._id && <div className="spinner-sm" />}
                                                </div>
                                            </td>
                                            <td><span style={{ fontSize: 11, fontWeight: 800, color: s.cgpa >= 2.0 ? 'var(--success)' : 'var(--danger)' }}>{s.cgpa >= 2.0 ? 'CLEAR' : 'PROBATION'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const MarksManager = () => {
    const { apiFetch } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            apiFetch('/teacher/profile'),
            apiFetch('/teacher/students')
        ]).then(([t, s]) => {
            if (t.success) setTeacher(t.teacher);
            if (s.success) setStudents(s.students);
            setLoading(false);
        });
    }, [apiFetch]);

    useEffect(() => {
        if (selectedSubject) {
            apiFetch(`/teacher/grades/${selectedSubject}`).then(d => {
                if (d.success) {
                    const mapped = {};
                    d.grades.forEach(g => { mapped[g.student._id || g.student] = { marks: g.marks, semester: g.semester }; });
                    setGrades(mapped);
                }
            });
        }
    }, [selectedSubject, apiFetch]);

    const handleMarksChange = (studentId, marks) => {
        setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], marks: Number(marks) } }));
    };

    const handleSave = async (studentId) => {
        const studentData = grades[studentId];
        if (!studentData?.marks || !selectedSubject) return addToast('Enter marks and select subject', 'error');
        setSaving(true);
        const student = students.find(s => s._id === studentId);
        const d = await apiFetch('/teacher/grades', {
            method: 'POST',
            body: JSON.stringify({ studentId, subjectId: selectedSubject, marks: studentData.marks, semester: student.semester })
        });
        if (d.success) addToast('Marks saved successfully', 'success');
        else addToast(d.message, 'error');
        setSaving(false);
    };

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;

    return (
        <div>
            <div className="table-header" style={{ marginBottom: 24, background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3>Academic Results Entry</h3>
                <select className="form-select" style={{ width: 300 }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                    <option value="">Select a subject...</option>
                    {teacher?.subjects?.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
            </div>

            {!selectedSubject ? <div className="empty-state"><h4>Select a subject to begin grading</h4></div> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Student</th><th>Semester</th><th>Marks (0-100)</th><th>Grade</th><th>Action</th></tr></thead>
                        <tbody>
                            {students.map(s => {
                                const g = grades[s._id] || { marks: 0 };
                                let letterClass = g.marks >= 80 ? 'paid' : g.marks >= 60 ? 'partial' : 'unpaid';
                                let letter = 'F';
                                if (g.marks >= 85) letter = 'A+'; else if (g.marks >= 80) letter = 'A'; else if (g.marks >= 75) letter = 'B+';
                                else if (g.marks >= 70) letter = 'B'; else if (g.marks >= 65) letter = 'C+'; else if (g.marks >= 60) letter = 'C';
                                else if (g.marks >= 50) letter = 'D';

                                return (
                                    <tr key={s._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{s.user?.name?.charAt(0)}</div>
                                                <div><div className="user-name">{s.user?.name}</div><div className="user-id">{s.studentId}</div></div>
                                            </div>
                                        </td>
                                        <td>S{s.semester}</td>
                                        <td><input type="number" min="0" max="100" className="form-input" style={{ width: 80 }} value={g.marks} onChange={e => handleMarksChange(s._id, e.target.value)} /></td>
                                        <td><span className={`badge badge-${letterClass}`}>{letter}</span></td>
                                        <td><button className="btn btn-primary btn-sm" onClick={() => handleSave(s._id)} disabled={saving}>Save</button></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {students.length === 0 && <div className="empty-state"><h4>No students enrolled in this subject's department</h4></div>}
                </div>
            )}
        </div>
    );
};

export const AttendanceManager = () => {
    const { apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [selectedSub, setSelectedSub] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allDeptSubjects, setAllDeptSubjects] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            apiFetch('/teacher/profile'),
            apiFetch('/teacher/students'),
            apiFetch('/admin/subjects') // Load all subjects as fallback
        ]).then(([p, s, sub]) => {
            if (p.success) {
                setTeacher(p.teacher);
            }
            if (s.success) {
                setStudents(s.students);
                const initialMap = {};
                s.students.forEach(st => initialMap[st._id] = 'present');
                setAttendanceMap(initialMap);
            }
            if (sub.success) {
                setAllDeptSubjects(sub.subjects.filter(item => item.department === p.teacher?.department));
            }
            setLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setLoading(false);
        });
    }, [apiFetch]);

    const activeSubjects = (teacher?.subjects && teacher.subjects.length > 0)
        ? teacher.subjects
        : allDeptSubjects;

    const handleBulkMark = async () => {
        if (!selectedSub) return addToast('Please select a subject', 'error');
        setSaving(true);
        try {
            const promises = Object.entries(attendanceMap).map(([sId, status]) =>
                apiFetch('/teacher/attendance', {
                    method: 'POST',
                    body: JSON.stringify({
                        studentId: sId,
                        subject: selectedSub,
                        date,
                        status
                    })
                })
            );
            const results = await Promise.all(promises);
            const failed = results.filter(r => !r.success);

            if (failed.length === 0) {
                addToast('Daily Attendance Submitted Successfully', 'success');
                // Optional: clear map or redirect
            } else {
                addToast(`${failed.length} records failed to save`, 'error');
            }
        } catch (err) {
            addToast('Error marking attendance', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;

    return (
        <div className="animate-in">
            <div className="card glass" style={{ marginBottom: 24, padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1fr', gap: 20, alignItems: 'end' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--primary-light)' }}>Select Subject</label>
                        <select
                            className="form-select"
                            value={selectedSub}
                            onChange={e => setSelectedSub(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', fontSize: '14px' }}
                        >
                            <option value="">-- Choose Subject --</option>
                            {activeSubjects?.map(s => {
                                const name = typeof s === 'object' ? s.name : 'Unknown Subject';
                                const code = typeof s === 'object' ? s.code : s;
                                return <option key={s._id || s} value={name}>{name} ({code})</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--primary-light)' }}>Attendance Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleBulkMark}
                        disabled={saving || students.length === 0}
                        style={{ height: '52px', fontSize: '15px' }}
                    >
                        {saving ? (
                            <><div className="spinner-sm" style={{ marginRight: 8 }} /> Submitting...</>
                        ) : 'Submit Daily Attendance'}
                    </button>
                </div>
                {(activeSubjects.length === 0) && (
                    <div className="alert alert-warning" style={{ marginTop: 20, fontSize: 13, background: 'rgba(255,168,38,0.1)', color: 'var(--warning)', padding: '10px 15px', borderRadius: 8, border: '1px solid rgba(255,168,38,0.2)' }}>
                        ⚠ No subjects are currently assigned to your profile in {teacher?.department || 'your'} department. Please contact the Academic Department for formal assignment.
                    </div>
                )}
                {activeSubjects.length > 0 && !selectedSub && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        Found {activeSubjects.length} subjects in your department. Please select one to begin marking attendance.
                    </div>
                )}
            </div>

            <div className="table-container glass">
                <div className="table-header">
                    <div>
                        <h3>Student Attendance Roster</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Roll call for {selectedSub || 'Selected Subject'}</p>
                    </div>
                    <div className="badge badge-paid">{students.length} Students Listed</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student Information</th>
                                <th>Student ID</th>
                                <th style={{ textAlign: 'center' }}>Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>{s.user?.name?.charAt(0)}</div>
                                            <div>
                                                <div className="user-name" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.user?.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.department} Dept.</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><code style={{ color: 'var(--primary-light)', fontSize: 12 }}>{s.studentId}</code></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            {['present', 'absent', 'leave'].map(st => (
                                                <button
                                                    key={st}
                                                    onClick={() => setAttendanceMap({ ...attendanceMap, [s._id]: st })}
                                                    className={`btn btn-sm ${attendanceMap[s._id] === st ? (st === 'present' ? 'btn-success' : st === 'absent' ? 'btn-danger' : 'btn-warning') : 'btn-ghost'}`}
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        padding: '6px 16px',
                                                        fontSize: '12px',
                                                        minWidth: '90px'
                                                    }}
                                                >{st}</button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {students.length === 0 && (
                    <div className="empty-state" style={{ padding: 60 }}>
                        <div style={{ fontSize: 40, marginBottom: 15 }}>👥</div>
                        <h4>No students found</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>There are no students assigned to your department.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export const AttendanceHistory = () => {
    const { apiFetch } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/teacher/attendance-history').then(d => {
            if (d.success) setHistory(d.records);
            setLoading(false);
        });
    }, [apiFetch]);

    if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>;

    // Group history by date
    const grouped = {};
    history.forEach(r => {
        const dateKey = new Date(r.date).toLocaleDateString();
        if (!grouped[dateKey]) grouped[dateKey] = {};
        if (!grouped[dateKey][r.subject]) grouped[dateKey][r.subject] = [];
        grouped[dateKey][r.subject].push(r);
    });

    return (
        <div className="animate-in">
            <div className="table-header" style={{ background: 'transparent', padding: '0 0 24px 0', border: 'none' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Daily Attendance Logs</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Audit trail of student presence by date and subject</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Refresh Logs</button>
            </div>

            {Object.entries(grouped).map(([date, subjects]) => (
                <div key={date} className="history-date-block" style={{ marginBottom: 40 }}>
                    <div style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(90deg, rgba(124, 77, 255, 0.15), transparent)',
                        borderRadius: '12px',
                        marginBottom: 20,
                        borderLeft: '5px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <div style={{ fontSize: '18px' }}>📅</div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '0.02em' }}>{date}</h4>
                    </div>

                    {Object.entries(subjects).map(([subject, records]) => (
                        <div key={subject} className="card glass" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-light)' }}>
                                    {subject} <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>— Session Summary</span>
                                </div>
                                <div className="badge badge-paid" style={{ fontSize: 10 }}>{records.length} Students Checked</div>
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Identifier</th>
                                        <th style={{ textAlign: 'center' }}>Roll Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(r => (
                                        <tr key={r._id}>
                                            <td style={{ fontWeight: 500 }}>{r.student?.user?.name || 'Unknown Student'}</td>
                                            <td><code style={{ fontSize: 11, opacity: 0.8 }}>{r.student?.studentId}</code></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`badge badge-${r.status}`} style={{ minWidth: '85px', justifyContent: 'center' }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ))}
            {history.length === 0 && (
                <div className="empty-state card glass" style={{ padding: '80px 40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: 20 }}>📋</div>
                    <h4>No records found</h4>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any attendance logs yet.</p>
                </div>
            )}
        </div>
    );
};
