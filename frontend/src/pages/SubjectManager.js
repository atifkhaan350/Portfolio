import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, addToast, useConfirm } from '../components/UI';

export const specializationsByDept = {
    'Computer Science': ['Artificial Intelligence', 'Cyber Security', 'Data Science', 'Web Development', 'Mobile Computing', 'Cloud Computing', 'General'],
    'Software Engineering': ['Quality Assurance', 'Project Management', 'System Design', 'Enterprise Software', 'DevOps', 'General'],
    'Electrical Engineering': ['Telecommunications', 'Power Systems', 'Control Systems', 'Electronics', 'Signal Processing', 'General'],
    'Data Science': ['Machine Learning', 'Big Data', 'Statistics', 'Data Visualization', 'Business Intelligence', 'General'],
    'Mechanical Engineering': ['Robotics', 'Thermodynamics', 'Manufacturing', 'Automotive', 'General'],
    'Civil Engineering': ['Structural Engineering', 'Transportation', 'Environmental', 'Geotechnical', 'General'],
    'Business Administration': ['Marketing', 'Finance', 'Human Resources', 'Supply Chain', 'General'],
    'Mathematics': ['Applied Math', 'Pure Math', 'Computational Math', 'Actuarial Science', 'General']
};

const SubjectManager = () => {
    const { apiFetch } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const { confirm, Dialog } = useConfirm();

    const departments = Object.keys(specializationsByDept);
    const initForm = { name: '', code: '', department: '', specialization: 'General', semester: 1, credits: 3, description: '' };
    const [form, setForm] = useState(initForm);
    const [saving, setSaving] = useState(false);

    const fetchSubjects = useCallback(async () => {
        try {
            const data = await apiFetch('/admin/subjects');
            if (data.success) setSubjects(data.subjects);
        } catch { addToast('Failed to load subjects', 'error'); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    const handleAdd = async () => {
        if (!form.name || !form.code || !form.department) {
            return addToast('Name, code and department are required', 'error');
        }
        setSaving(true);
        try {
            const data = await apiFetch('/admin/subjects', {
                method: 'POST', body: JSON.stringify(form)
            });
            if (data.success) {
                setModalOpen(false);
                setForm(initForm);
                fetchSubjects();
                addToast('Subject created successfully', 'success');
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleEdit = async () => {
        setSaving(true);
        try {
            const data = await apiFetch(`/admin/subjects/${selected._id}`, {
                method: 'PUT', body: JSON.stringify(form)
            });
            if (data.success) {
                addToast('Subject updated', 'success');
                setEditModal(false);
                fetchSubjects();
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (s) => {
        const ok = await confirm(`Delete subject "${s.name}"?`);
        if (!ok) return;
        const data = await apiFetch(`/admin/subjects/${s._id}`, { method: 'DELETE' });
        if (data.success) { addToast('Subject deleted', 'success'); fetchSubjects(); }
        else addToast(data.message, 'error');
    };

    const openEdit = (s) => {
        setSelected(s);
        setForm({ ...s });
        setEditModal(true);
    };

    const SubjectForm = () => (
        <>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Subject Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" />
                </div>
                <div className="form-group">
                    <label className="form-label">Subject Code *</label>
                    <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS-201" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value, specialization: 'General' })}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select className="form-select" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                        {form.department ? (
                            specializationsByDept[form.department].map(s => <option key={s} value={s}>{s}</option>)
                        ) : (
                            <option value="General">General</option>
                        )}
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Credits</label>
                    <input type="number" className="form-input" value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" style={{ height: 60 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Subject details..." />
            </div>
        </>
    );

    return (
        <div>
            <Dialog />
            <div className="table-container">
                <div className="table-header">
                    <div>
                        <h3>Subject Management</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{subjects.length} subjects in total</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setForm(initForm); setModalOpen(true); }}>
                        Add Subject
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
                ) : subjects.length === 0 ? (
                    <div className="empty-state">
                        <h4>No subjects found</h4>
                        <p>Add a subject to get started</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Code</th>
                                    <th>Dept. & Specialization</th>
                                    <th>Semester</th>
                                    <th>Credits</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s._id}>
                                        <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                                        <td><code style={{ fontSize: 12, color: 'var(--primary-light)' }}>{s.code}</code></td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{s.department}</div>
                                            <div style={{ fontSize: 11, color: 'var(--primary-light)' }}>{s.specialization}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>S{s.semester}</td>
                                        <td style={{ textAlign: 'center' }}>{s.credits}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Subject" footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create Subject'}</button></>}>
                <SubjectForm />
            </Modal>

            <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Subject" footer={<><button className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></>}>
                <SubjectForm />
            </Modal>
        </div>
    );
};

export default SubjectManager;
