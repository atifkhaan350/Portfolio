import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, addToast, useConfirm } from '../components/UI';

const StudentsManager = ({ readOnly = false }) => {
    const { apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const { confirm, Dialog } = useConfirm();

    const departments = [
        'Computer Science', 'Software Engineering', 'Electrical Engineering',
        'Data Science', 'Mechanical Engineering', 'Civil Engineering',
        'Business Administration', 'Mathematics'
    ];

    const initForm = { name: '', email: '', password: '', phone: '', department: '', semester: 1, batch: '', feeAmount: 50000 };
    const [form, setForm] = useState(initForm);
    const [saving, setSaving] = useState(false);

    const fetchStudents = useCallback(async () => {
        try {
            const data = await apiFetch('/admin/students');
            if (data.success) setStudents(data.students);
        } catch { addToast('Failed to load students', 'error'); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleAdd = async () => {
        if (!form.name || !form.email || !form.password || !form.department) {
            return addToast('Name, email, password and department are required', 'error');
        }
        setSaving(true);
        try {
            const data = await apiFetch('/admin/add-student', {
                method: 'POST', body: JSON.stringify(form)
            });
            if (data.success) {
                setCreatedCredentials({ name: data.student.name, userId: data.student.userId, email: form.email, password: form.password });
                setModalOpen(false);
                setForm(initForm);
                fetchStudents();
                addToast('Student created successfully!', 'success');
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleEdit = async () => {
        setSaving(true);
        try {
            const data = await apiFetch(`/admin/students/${selectedStudent._id}`, {
                method: 'PUT', body: JSON.stringify(form)
            });
            if (data.success) {
                addToast('Student updated!', 'success');
                setEditModal(false);
                fetchStudents();
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (student) => {
        const ok = await confirm(`Delete student ${student.user?.name}? This cannot be undone.`);
        if (!ok) return;
        const data = await apiFetch(`/admin/students/${student._id}`, { method: 'DELETE' });
        if (data.success) { addToast('Student deleted', 'success'); fetchStudents(); }
        else addToast(data.message, 'error');
    };

    const openEdit = (student) => {
        setSelectedStudent(student);
        setForm({
            name: student.user?.name || '', email: student.user?.email || '',
            phone: student.user?.phone || '', department: student.department || '',
            semester: student.semester || 1, batch: student.batch || '',
            feeAmount: student.feeAmount || 50000, password: '',
        });
        setEditModal(true);
    };

    const filtered = students.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(search.toLowerCase());
        const matchesDept = deptFilter === 'all' || s.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    // Grouping by department for Admin view
    const groupedStudents = {};
    filtered.forEach(s => {
        if (!groupedStudents[s.department]) groupedStudents[s.department] = [];
        groupedStudents[s.department].push(s);
    });

    const studentTable = (list) => (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>ID</th>
                    <th>Semester</th>
                    <th>CGPA</th>
                    <th>Attendance</th>
                    <th>Fees</th>
                    {!readOnly && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {list.map(s => (
                    <tr key={s._id}>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar">{s.user?.name?.charAt(0)}</div>
                                <div><div className="user-name">{s.user?.name}</div><div className="user-id">{s.user?.email}</div></div>
                            </div>
                        </td>
                        <td><code style={{ fontSize: 12, color: 'var(--primary-light)' }}>{s.studentId}</code></td>
                        <td>S{s.semester}</td>
                        <td style={{ fontWeight: 700 }}>{Number(s.cgpa).toFixed(2)}</td>
                        <td>{s.attendancePercentage}%</td>
                        <td><span className={`badge badge-${s.feeStatus === 'paid' ? 'paid' : s.feeStatus === 'partial' ? 'partial' : 'unpaid'}`}>{s.feeStatus}</span></td>
                        {!readOnly && (
                            <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)}>Edit</button>
                                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s)}>Delete</button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <Dialog />
            <div className="table-container">
                <div className="table-header">
                    <div>
                        <h3>Enrolled Students Hub</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} students showing in current view</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select className="form-select" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                            <option value="all">Every Department</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="search-input-wrap">
                            <input className="search-input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {!readOnly && (
                            <button className="btn btn-primary" onClick={() => { setForm(initForm); setModalOpen(true); }}>
                                Enrol Student
                            </button>
                        )}
                    </div>
                </div>

                {loading ? <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div> : (
                    Object.keys(groupedStudents).length === 0 ? (
                        <div className="empty-state"><h4>No students found</h4></div>
                    ) : (
                        Object.entries(groupedStudents).map(([dept, list]) => (
                            <div key={dept} style={{ marginBottom: 30 }}>
                                <div style={{
                                    padding: '10px 18px', background: 'rgba(108,99,255,0.05)',
                                    borderLeft: '4px solid var(--primary)', borderRadius: '0 8px 8px 0',
                                    marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <h4 style={{ margin: 0, fontSize: 14 }}>{dept}</h4>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{list.length} STUDENTS</span>
                                </div>
                                {studentTable(list)}
                            </div>
                        ))
                    )
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Enrol New Student"
                footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>Confirm Enrollment</button></>}
            >
                <div className="form-row">
                    <div className="form-group flex-2"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-group flex-1"><label className="form-label">Semester</label><select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>S{n}</option>)}</select></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Department *</label><select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}><option value="">Select Dept</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Batch</label><input className="form-input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 2024" /></div>
                </div>
            </Modal>

            <Modal
                isOpen={!!createdCredentials}
                onClose={() => setCreatedCredentials(null)}
                title="Enrollment Successful"
            >
                {createdCredentials && (
                    <div className="credentials-box">
                        <div className="credential-row"><span className="label">Student ID</span><span className="value">{createdCredentials.userId}</span></div>
                        <div className="credential-row"><span className="label">Password</span><span className="value">{createdCredentials.password}</span></div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 15 }}>Share these credentials with the student for portal access.</p>
                        <button className="btn btn-primary btn-block" onClick={() => setCreatedCredentials(null)}>Done</button>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                title="Modify Student Record"
                footer={<><button className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleEdit} disabled={saving}>Save Changes</button></>}
            >
                <div className="form-row">
                    <div className="form-group flex-2"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-group flex-1"><label className="form-label">Semester</label><select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>S{n}</option>)}</select></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Department</label><select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">CGPA</label><input type="number" step="0.01" className="form-input" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: Number(e.target.value) })} /></div>
                </div>
                <div className="form-group"><label className="form-label">New Password (leave blank to keep)</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            </Modal>
        </div>
    );
};

export default StudentsManager;
