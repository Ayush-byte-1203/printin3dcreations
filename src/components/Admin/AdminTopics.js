import { adminFetch } from '../../adminApi';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Upload
} from 'lucide-react';
import '../CSS/Admin.css';


const AdminTopics = () => {
    const { topicsData, isBackendOnline, refreshData } = useData();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('Key');
    const [desc, setDesc] = useState('');
    const [details, setDetails] = useState('');
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!isBackendOnline) {
            alert('File uploads are disabled in offline mode.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await adminFetch('https://ayush1273.pythonanywhere.com/api/upload/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setImage(data.url);
            } else {
                alert(data.error || 'Failed to upload image.');
            }
        } catch (err) {
            alert("Upload failed. Verify server connections.");
        } finally {
            setUploading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTopic(null);
        setTitle('');
        setIcon('Key');
        setDesc('');
        setDetails('');
        setImage('');
        setError('');
        setModalOpen(true);
    };

    const openEditModal = (topic) => {
        setEditingTopic(topic);
        setTitle(topic.title);
        setIcon(topic.icon);
        setDesc(topic.desc);
        setDetails(topic.details || '');
        setImage(topic.image || '');
        setError('');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (!isBackendOnline) {
            setError('Modifications are disabled in offline mode.');
            return;
        }

        if (!title || !desc) {
            setError('Please fill in all required fields.');
            return;
        }

        setSaving(true);
        const payload = { title, icon, desc, details, image };

        try {
            let response;
            if (editingTopic) {
                // Update
                response = await adminFetch(`https://ayush1273.pythonanywhere.com/api/topics/${editingTopic.id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                response = await adminFetch('https://ayush1273.pythonanywhere.com/api/topics/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                await refreshData();
                setModalOpen(false);
            } else {
                const data = await response.json();
                setError(data.detail || 'Failed to save category.');
            }
        } catch (err) {
            setError('Network error. Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!isBackendOnline) {
            alert('Modifications are disabled in offline mode.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete category "${name}"? This will delete all products under it!`)) {
            try {
                const response = await adminFetch(`https://ayush1273.pythonanywhere.com/api/topics/${id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await refreshData();
                } else {
                    alert('Failed to delete category.');
                }
            } catch (err) {
                alert('Network error. Failed to delete.');
            }
        }
    };

    return (
        <div style={{ animation: 'modalSlideUp 0.4s ease' }}>
            <div className="admin-panel-card">
                <div className="admin-panel-header">
                    <h2>Manage Categories</h2>
                    <button onClick={openCreateModal} className="admin-btn-action">
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>ID</th>
                                {/* <th>Icon</th> */}
                                <th>Title</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topicsData.map((topic) => (
                                <tr key={topic.id}>
                                    <td>
                                        <img
                                            src={topic.image ? topic.image : 'https://via.placeholder.com/100x100?text=Category'}
                                            alt={topic.title}
                                            className="table-thumbnail"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/100x100?text=Category';
                                            }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 700 }}>#{topic.id}</td>
                                    {/* <td>
                                        <div className="table-icon-wrap">
                                            {iconMap[topic.icon] || <HelpCircle size={18} />}
                                        </div>
                                    </td> */}
                                    <td style={{ fontWeight: 600 }}>{topic.title}</td>
                                    <td style={{ color: 'var(--admin-text-muted)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {topic.desc}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button onClick={() => openEditModal(topic)} className="btn-table-action edit" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(topic.id, topic.title)} className="btn-table-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{editingTopic ? 'Edit Category' : 'Create Category'}</h3>
                            <button onClick={() => setModalOpen(false)} className="btn-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="admin-modal-body">
                                {error && <div className="login-error-box">{error}</div>}

                                <div className="admin-form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        required
                                        className="admin-form-control"
                                        placeholder="e.g. Signature Keychains"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>


                                {/* <div className="admin-form-group">
                                    <label>Icon Identifier</label>
                                    <select
                                        className="admin-form-control"
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                    >
                                        <option value="Key">Key (Keychain)</option>
                                        <option value="PencilRuler">PencilRuler (Design/Draft)</option>
                                        <option value="Palette">Palette (Decor/Color)</option>
                                        <option value="Gamepad2">Gamepad2 (Desk Gear/Gaming)</option>
                                        <option value="GraduationCap">GraduationCap (Models/Learn)</option>
                                        <option value="Image">ImageIcon (Frames/Photos)</option>
                                    </select>
                                </div> */}

                                <div className="admin-form-group">
                                    <label>Short Description *</label>
                                    <textarea
                                        required
                                        className="admin-form-control"
                                        rows="3"
                                        placeholder="Short summary displayed on homepage cards..."
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>Detailed Overview (Optional)</label>
                                    <textarea
                                        className="admin-form-control"
                                        rows="4"
                                        placeholder="Detailed description shown in list header..."
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>Category Image</label>

                                    {/* Direct File Upload */}
                                    <div className="media-manager-box">
                                        <Upload size={24} style={{ color: 'var(--admin-text-muted)', marginBottom: '8px' }} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                                            {uploading ? 'Uploading image...' : 'Click to Upload Category Image'}
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="media-upload-input"
                                            disabled={uploading}
                                            onChange={handleFileUpload}
                                        />
                                    </div>

                                    {/* External Image URL text input */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <input
                                            type="text"
                                            className="admin-form-control"
                                            style={{ height: '36px', fontSize: '0.8rem' }}
                                            placeholder="Or paste external image URL..."
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                        />
                                    </div>

                                    {/* Image Preview */}
                                    {image && (
                                        <div style={{ marginTop: '12px', position: 'relative', width: '80px', height: '80px', border: '1px solid var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img
                                                src={image}
                                                alt="category preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImage('')}
                                                className="btn-media-delete"
                                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="admin-btn-action">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTopics;
