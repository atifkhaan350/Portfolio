import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, addToast, useConfirm } from '../components/UI';
import { specializationsByDept } from './SubjectManager';

// Reusable user manager component for Admins & Teachers
const UserManager = ({ role }) => {
    const { apiFetch, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const { confirm, Dialog } = useConfirm();

    const initForm = {
        name: '', email: '', password: '', phone: '', address: '',
        department: '', subjects: [], specialization: 'General'
    };
    const [form, setForm] = useState(initForm);
    const [saving, setSaving] = useState(false);

    const endpoint = role === 'admin' ? '/admin/admins' : '/admin/teachers';
    const addEndpoint = role === 'admin' ? '/admin/add-admin' : '/admin/add-teacher';
    const title = role === 'admin' ? 'Admin' : 'Teacher';

    const departments = Object.keys(specializationsByDept);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await apiFetch(endpoint);
            if (data.success) {
                setUsers(role === 'admin' ? data.admins : data.teachers);
            }
        } catch { addToast(`Failed to load ${title}s`, 'error'); }
        finally { setLoading(false); }
    }, [apiFetch, endpoint, role, title]);

    const fetchSubjects = useCallback(async () => {
        if (role !== 'teacher') return;
        try {
            const data = await apiFetch('/admin/subjects');
            if (data.success) setAllSubjects(data.subjects);
        } catch { }
    }, [apiFetch, role]);

    useEffect(() => {
        fetchUsers();
        fetchSubjects();
    }, [fetchUsers, fetchSubjects]);

    const handleAdd = async () => {
        if (!form.name || !form.email || !form.password) {
            return addToast('Name, email and password are required', 'error');
        }
        if (role === 'teacher' && !form.department) {
            return addToast('Department is required for teachers', 'error');
        }
        setSaving(true);
        try {
            const data = await apiFetch(addEndpoint, {
                method: 'POST', body: JSON.stringify(form)
            });
            if (data.success) {
                const created = data.teacher || data.admin;
                setCreatedCredentials({
                    name: created.name,
                    userId: created.userId,
                    email: form.email,
                    password: form.password,
                    role: created.role
                });
                setModalOpen(false);
                setForm(initForm);
                fetchUsers();
                addToast(`${title} created successfully!`, 'success');
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleEdit = async () => {
        setSaving(true);
        try {
            const body = { ...form };
            if (!body.password) delete body.password;
            const data = await apiFetch(`${endpoint}/${selected._id}`, {
                method: 'PUT', body: JSON.stringify(body)
            });
            if (data.success) {
                addToast(`${title} updated!`, 'success');
                setEditModal(false);
                fetchUsers();
            } else { addToast(data.message, 'error'); }
        } catch { addToast('Server error', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (u) => {
        if (u._id === currentUser._id) return addToast("You can't delete yourself!", 'error');
        const ok = await confirm(`Delete ${title} "${u.name || (u.user && u.user.name)}"? This cannot be undone.`);
        if (!ok) return;
        const data = await apiFetch(`${endpoint}/${u._id}`, { method: 'DELETE' });
        if (data.success) { addToast(`${title} deleted`, 'success'); fetchUsers(); }
        else addToast(data.message, 'error');
    };

    const toggleActive = async (u) => {
        const data = await apiFetch(`${endpoint}/${u._id}`, {
            method: 'PUT', body: JSON.stringify({ isActive: !u.isActive })
        });
        if (data.success) { addToast(`${title} status updated`, 'success'); fetchUsers(); }
        else addToast(data.message, 'error');
    };

    const isSuperadmin = (u) => (u.user?.role === 'superadmin' || u.role === 'superadmin');

    const openEdit = (u) => {
        setSelected(u);
        const userData = u.user || u;
        setForm({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            password: '',
            department: u.department || '',
            subjects: u.subjects ? u.subjects.map(s => s._id || s) : [],
            specialization: u.specialization || 'General'
        });
        setEditModal(true);
    };

    const handleSubjectToggle = (subId) => {
        const current = [...form.subjects];
        const idx = current.indexOf(subId);
        if (idx > -1) current.splice(idx, 1);
        else current.push(subId);
        setForm({ ...form, subjects: current });
    };

    const filteredUsers = users.filter(u => {
        const name = (u.user?.name || u.name || '').toLowerCase();
        const email = (u.user?.email || u.email || '').toLowerCase();
        const userId = (u.user?.userId || u.userId || '').toLowerCase();
        const s = search.toLowerCase();
        return name.includes(s) || email.includes(s) || userId.includes(s);
    });

    const renderUserForm = () => {
        const isEditingSuper = selected && isSuperadmin(selected);
        const hidePassword = isEditingSuper && currentUser.role !== 'superadmin';

        return (
            <>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                </div>
                {!hidePassword ? (
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{selected ? 'New Password (optional)' : 'Password *'}</label>
                            <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                    </div>
                ) : (
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                )}

                {role === 'teacher' && (
                    <>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value, specialization: 'General', subjects: [] })}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Specialization Area *</label>
                                <select className="form-select" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value, subjects: [] })}>
                                    {form.department ? (
                                        specializationsByDept[form.department].map(s => <option key={s} value={s}>{s}</option>)
                                    ) : (
                                        <option value="General">General</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assigned {form.specialization} Subjects</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 150, overflowY: 'auto', padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                {allSubjects.filter(s => s.department === form.department && s.specialization === form.specialization).map(s => (
                                    <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.subjects.includes(s._id)} onChange={() => handleSubjectToggle(s._id)} />
                                        <span>{s.name} <small style={{ color: 'var(--text-muted)' }}>({s.code})</small></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
            </>
        );
    };

    return (
        <div>
            <Dialog />
            <div className="table-container">
                <div className="table-header">
                    <div>
                        <h3>{title} Management</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{users.length} {title.toLowerCase()}s in system</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="search-input-wrap">
                            <input className="search-input" placeholder={`Search...`} value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={() => { setForm(initForm); setModalOpen(true); }}>
                            Add {title}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <h4>No {title.toLowerCase()}s found</h4>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{title}</th>
                                    <th>ID</th>
                                    {role === 'teacher' && <th>Dept. & Area</th>}
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, i) => {
                                    const userData = u.user || u;
                                    const isSuper = isSuperadmin(u);
                                    const canEdit = currentUser.role === 'superadmin' || !isSuper;

                                    return (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">{userData.name?.charAt(0)}</div>
                                                    <div><div className="user-name">{userData.name}</div><div className="user-id">{userData.email}</div></div>
                                                </div>
                                            </td>
                                            <td><code style={{ fontSize: 12, color: 'var(--primary-light)' }}>{userData.userId}</code></td>
                                            {role === 'teacher' && (
                                                <td>
                                                    <div style={{ fontSize: 13 }}>{u.department}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.specialization}</div>
                                                </td>
                                            )}
                                            <td>
                                                <span className={`badge badge-${userData.isActive ? 'active' : 'inactive'}`}>
                                                    {userData.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>}
                                                    {canEdit && (
                                                        <button className={`btn btn-sm ${userData.isActive ? 'btn-ghost' : 'btn-success'}`} onClick={() => toggleActive(u)}>
                                                            {userData.isActive ? 'Pause' : 'Resume'}
                                                        </button>
                                                    )}
                                                    {canEdit && userData.role !== 'superadmin' && (
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Delete</button>
                                                    )}
                                                    {!canEdit && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>System Restricted</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${title}`} footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>Create Account</button></>}>
                {renderUserForm()}
            </Modal>

            <Modal isOpen={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Account Created">
                {createdCredentials && (
                    <div className="credentials-box">
                        <div className="credential-row"><span className="label">ID</span><span className="value">{createdCredentials.userId}</span></div>
                        <div className="credential-row"><span className="label">Password</span><span className="value">{createdCredentials.password}</span></div>
                        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => setCreatedCredentials(null)}>Done</button>
                    </div>
                )}
            </Modal>

            <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={`Edit ${title}`} footer={<><button className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleEdit} disabled={saving}>Save Changes</button></>}>
                {renderUserForm()}
            </Modal>
        </div>
    );
};

export const AdminsManager = () => <UserManager role="admin" />;
export const TeachersManager = () => <UserManager role="teacher" />;

export default UserManager;
