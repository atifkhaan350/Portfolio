import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, addToast, useConfirm } from './UI';

// --- Shared LMS Components ---

export const NoticeBoard = ({ userRole }) => {
    const { apiFetch } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', target: 'all', priority: 'medium' });

    const fetchNotices = useCallback(async () => {
        const endpoint = userRole === 'student' ? '/student/announcements' : '/teacher/announcements';
        const d = await apiFetch(endpoint);
        if (d.success) setNotices(d.announcements);
        setLoading(false);
    }, [apiFetch, userRole]);

    useEffect(() => { fetchNotices(); }, [fetchNotices]);

    const handlePost = async () => {
        const d = await apiFetch('/teacher/announcements', {
            method: 'POST', body: JSON.stringify(form)
        });
        if (d.success) {
            addToast('Announcement posted', 'success');
            setModalOpen(false);
            fetchNotices();
        }
    };

    return (
        <div className="card">
            <div className="table-header" style={{ marginBottom: 20 }}>
                <h3>University Notice Board</h3>
                {userRole !== 'student' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Post Announcement</button>
                )}
            </div>
            {loading ? <div className="spinner" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notices.map(n => (
                        <div key={n._id} style={{
                            padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                            borderLeft: `4px solid ${n.priority === 'high' ? 'var(--danger)' : n.priority === 'medium' ? 'var(--warning)' : 'var(--primary)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <h4 style={{ margin: 0, fontSize: 15 }}>{n.title}</h4>
                                <span style={{ fontSize: 10, opacity: 0.6 }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0' }}>{n.content}</p>
                            <div style={{ fontSize: 11, display: 'flex', gap: 10 }}>
                                <span className="badge badge-ghost" style={{ fontSize: 9 }}>By {n.author?.name || 'Admin'}</span>
                                <span className="badge badge-ghost" style={{ fontSize: 9, textTransform: 'capitalize' }}>{n.target}</span>
                            </div>
                        </div>
                    ))}
                    {notices.length === 0 && <div className="empty-state">No announcements for your category</div>}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement">
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Content</label>
                    <textarea className="form-input" style={{ height: 100 }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Target Audience</label>
                        <select className="form-select" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
                            <option value="all">Everyone</option>
                            <option value="students">Students Only</option>
                            <option value="teachers">Teachers Only</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">Urgent</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={handlePost}>Publish Notice</button>
            </Modal>
        </div>
    );
};

// --- Assignment Components ---

export const StudentAssignments = () => {
    const { apiFetch } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitModal, setSubmitModal] = useState(null);
    const [content, setContent] = useState('');

    const fetchAssignments = useCallback(async () => {
        const d = await apiFetch('/student/assignments');
        if (d.success) setAssignments(d.assignments);
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    const handleSubmit = async () => {
        if (!content) return;
        const d = await apiFetch('/student/submit-assignment', {
            method: 'POST', body: JSON.stringify({ assignmentId: submitModal._id, content })
        });
        if (d.success) {
            addToast('Assignment submitted!', 'success');
            setSubmitModal(null);
            setContent('');
            fetchAssignments();
        } else addToast(d.message, 'error');
    };

    return (
        <div className="table-container">
            <div className="table-header"><h3>Course Assignments</h3></div>
            {loading ? <div className="spinner" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {assignments.map(a => {
                        const isOverdue = new Date(a.deadline) < new Date() && !a.submission;
                        return (
                            <div key={a._id} className="card" style={{ border: a.submission ? '1px solid var(--success-light)' : isOverdue ? '1px solid var(--danger-light)' : '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <h4 style={{ margin: 0 }}>{a.title}</h4>
                                    <span style={{ fontSize: 11, fontWeight: 700 }}>{a.totalMarks} Marks</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{a.subject?.name} · {a.teacher?.name}</div>
                                <p style={{ fontSize: 13, marginBottom: 16 }}>{a.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div style={{ fontSize: 11 }}>
                                        <div style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>Deadline: {new Date(a.deadline).toLocaleString()}</div>
                                        {a.submission && <div style={{ color: 'var(--success)', marginTop: 4 }}>Submitted on {new Date(a.submission.submittedAt).toLocaleDateString()}</div>}
                                    </div>
                                    {!a.submission ? (
                                        <button className={`btn btn-sm ${isOverdue ? 'btn-ghost' : 'btn-primary'}`} disabled={isOverdue} onClick={() => setSubmitModal(a)}>
                                            {isOverdue ? 'Overdue' : 'Submit Now'}
                                        </button>
                                    ) : (
                                        <div className="badge badge-paid">Graded: {a.submission.obtainedMarks || 0}/{a.totalMarks}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Modal isOpen={!!submitModal} onClose={() => setSubmitModal(null)} title={`Submit: ${submitModal?.title}`}>
                <div className="form-group">
                    <label className="form-label">Submission Content (Text or URL)</label>
                    <textarea className="form-input" style={{ height: 120 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Type your answer or paste link to your document (Drive/Github)..." />
                </div>
                <button className="btn btn-primary btn-block" onClick={handleSubmit}>Confirm Submission</button>
            </Modal>
        </div>
    );
};

export const TeacherAssignments = () => {
    const { apiFetch } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [submissionModal, setSubmissionModal] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [gradeForm, setGradeForm] = useState({ obtainedMarks: 0, feedback: '' });
    const [activeSubId, setActiveSubId] = useState(null);

    const [form, setForm] = useState({ title: '', description: '', subject: '', deadline: '', totalMarks: 10 });

    const fetchData = useCallback(async () => {
        const [a, s, p] = await Promise.all([
            apiFetch('/teacher/assignments'),
            apiFetch('/admin/subjects'), // To assign subjects
            apiFetch('/teacher/profile')
        ]);
        if (a.success) setAssignments(a.assignments);
        if (s.success && p.success) {
            // Only subjects in teacher's department
            setSubjects(s.subjects.filter(sub => sub.department === p.teacher.department));
        }
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async () => {
        const d = await apiFetch('/teacher/assignments', { method: 'POST', body: JSON.stringify(form) });
        if (d.success) {
            addToast('Assignment created', 'success');
            setModalOpen(false);
            fetchData();
        }
    };

    const viewSubmissions = async (a) => {
        setSubmissionModal(a);
        const d = await apiFetch(`/teacher/submissions/${a._id}`);
        if (d.success) setSubmissions(d.submissions);
    };

    const handleGrade = async () => {
        const d = await apiFetch(`/teacher/grade-submission/${activeSubId}`, {
            method: 'PUT', body: JSON.stringify(gradeForm)
        });
        if (d.success) {
            addToast('Grade saved', 'success');
            setSubmissions(s => s.map(item => item._id === activeSubId ? { ...item, ...gradeForm } : item));
            setActiveSubId(null);
        }
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <h3>My Assignments</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Create Assignment</button>
            </div>
            {loading ? <div className="spinner" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {assignments.map(a => (
                        <div key={a._id} className="card">
                            <h4 style={{ margin: '0 0 4px 0' }}>{a.title}</h4>
                            <div style={{ fontSize: 11, color: 'var(--primary-light)', marginBottom: 10 }}>{a.subject?.name} ({a.subject?.code})</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{a.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 10 }}>
                                    <div>Due: {new Date(a.deadline).toLocaleDateString()}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Max: {a.totalMarks} Marks</div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => viewSubmissions(a)}>View Submissions</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Assignment">
                <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input type="datetime-local" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Max Marks</label>
                        <input type="number" className="form-input" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} />
                    </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={handleCreate}>Create Task</button>
            </Modal>

            <Modal isOpen={!!submissionModal} onClose={() => setSubmissionModal(null)} title={`Submissions: ${submissionModal?.title}`} width={800}>
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Submission</th><th>Date</th><th>Marks</th><th>Action</th></tr></thead>
                    <tbody>
                        {submissions.map(s => (
                            <tr key={s._id}>
                                <td>{s.student?.name}</td>
                                <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.content}</td>
                                <td>{new Date(s.submittedAt).toLocaleDateString()}</td>
                                <td>{s.obtainedMarks || 0}</td>
                                <td>
                                    <button className="btn btn-primary btn-sm" onClick={() => { setActiveSubId(s._id); setGradeForm({ obtainedMarks: s.obtainedMarks || 0, feedback: s.feedback || '' }); }}>Grade</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {submissions.length === 0 && <div className="empty-state">No submissions yet</div>}
            </Modal>

            <Modal isOpen={!!activeSubId} onClose={() => setActiveSubId(null)} title="Grade Submission">
                <div className="form-group">
                    <label className="form-label">Obtained Marks</label>
                    <input type="number" className="form-input" value={gradeForm.obtainedMarks} onChange={e => setGradeForm({ ...gradeForm, obtainedMarks: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Feedback</label>
                    <textarea className="form-input" value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-block" onClick={handleGrade}>Save Grade</button>
            </Modal>
        </div>
    );
};

// --- Materials ---

export const CourseResources = ({ userRole }) => {
    const { apiFetch } = useAuth();
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'pdf', url: '', subject: '' });

    const fetchData = useCallback(async () => {
        const endpoint = userRole === 'student' ? '/student/resources' : '/teacher/resources';
        const d = await apiFetch(endpoint);
        if (d.success) setResources(d.resources);
        if (userRole === 'teacher') {
            const s = await apiFetch('/admin/subjects');
            const p = await apiFetch('/teacher/profile');
            if (s.success && p.success) setSubjects(s.subjects.filter(item => item.department === p.teacher.department));
        }
        setLoading(false);
    }, [apiFetch, userRole]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpload = async () => {
        const d = await apiFetch('/teacher/resources', { method: 'POST', body: JSON.stringify(form) });
        if (d.success) {
            addToast('Resource added', 'success');
            setModalOpen(false);
            fetchData();
        }
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <h3>Course Materials</h3>
                {userRole === 'teacher' && <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Material</button>}
            </div>
            {loading ? <div className="spinner" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {resources.map(r => (
                        <div key={r._id} className="card" style={{ display: 'flex', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 10 }}>{r.type.toUpperCase()}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{r.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{r.subject?.name} · {r.teacher?.name}</div>
                                <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ width: '100%' }}>Download / View</a>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && <div className="empty-state">No materials uploaded yet</div>}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Course Material">
                <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Resource Title</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="pdf">PDF Document</option>
                            <option value="video">Video Link</option>
                            <option value="document">Word/PPT</option>
                            <option value="link">Website/External Link</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Content URL</label>
                        <input className="form-input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                    </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={handleUpload}>Post Material</button>
            </Modal>
        </div>
    );
};

// --- Notification Center ---

export const NotificationCenter = () => {
    const { apiFetch } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const d = await apiFetch('/student/notifications');
        if (d.success) setNotifications(d.notifications);
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'fee': return '💰';
            case 'assignment': return '📝';
            case 'announcement': return '📢';
            default: return '🔔';
        }
    };

    return (
        <div className="card" style={{ padding: 20 }}>
            <div className="table-header" style={{ marginBottom: 15 }}>
                <h3>Academic Notifications</h3>
                <span className="badge badge-ghost">{notifications.length} New</span>
            </div>
            {loading ? <div className="spinner" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notifications.map((n, i) => (
                        <div key={i} style={{
                            padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                            display: 'flex', gap: 15, alignItems: 'start', border: '1px solid var(--border-light)'
                        }}>
                            <div style={{ fontSize: 24 }}>{getIcon(n.type)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{n.title}</h4>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(n.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <div className="empty-state" style={{ padding: 20 }}>All caught up!</div>}
                </div>
            )}
        </div>
    );
};
