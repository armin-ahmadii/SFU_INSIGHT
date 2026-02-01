import React, { useState, useRef } from 'react';
import { X, Upload, MessageSquare, Link2, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createContribution, uploadNotes } from '../api/contributions';

// Shared modal wrapper
function ModalWrapper({ isOpen, onClose, title, icon: Icon, children }) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '12px',
                            color: '#a6192e'
                        }}>
                            <Icon size={22} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#6b7280'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

// Toast notification component
export function Toast({ message, type, onClose }) {
    if (!message) return null;

    const colors = {
        success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: CheckCircle },
        error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: AlertCircle }
    };
    const c = colors[type] || colors.success;
    const IconComponent = c.icon;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 2000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <IconComponent size={20} color={c.text} />
            <span style={{ color: c.text, fontWeight: '600', fontSize: '14px' }}>{message}</span>
            <button
                onClick={onClose}
                style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: c.text }}
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Upload Notes Modal
export function UploadNotesModal({ isOpen, onClose, courseCode, onSuccess }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const MAX_SIZE = 10 * 1024 * 1024;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setError('');

        if (!selected) return;

        if (!ALLOWED_TYPES.includes(selected.type)) {
            setError('File type not allowed. Use PDF, PNG, JPG, DOC, or DOCX.');
            return;
        }

        if (selected.size > MAX_SIZE) {
            setError('File too large. Maximum size is 10 MB.');
            return;
        }

        setFile(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title.trim()) return;

        setLoading(true);
        setError('');
        setProgress(0);

        try {
            const token = await getToken();
            await uploadNotes({
                courseCode,
                title: title.trim(),
                file,
                displayName: user?.fullName || user?.username || 'Anonymous'
            }, token, setProgress);

            onSuccess?.();
            onClose();
            setTitle('');
            setFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Upload Notes" icon={Upload}>
            <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Final Exam Study Guide"
                        required
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '6px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </label>

                <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>File</span>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            marginTop: '6px',
                            padding: '32px',
                            border: '2px dashed #d1d5db',
                            borderRadius: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: file ? '#f9fafb' : 'white'
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            style={{ display: 'none' }}
                        />
                        {file ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <FileText size={24} color="#a6192e" />
                                <span style={{ fontWeight: '600', color: '#111827' }}>{file.name}</span>
                            </div>
                        ) : (
                            <>
                                <Upload size={32} color="#9ca3af" />
                                <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
                                    Click to upload PDF, PNG, JPG, DOC, or DOCX
                                </p>
                                <p style={{ marginTop: '4px', color: '#9ca3af', fontSize: '12px' }}>Max 10 MB</p>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} color="#dc2626" />
                        <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                {loading && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: '#a6192e',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                        <p style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                            Uploading... {progress}%
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !file || !title.trim()}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: loading || !file || !title.trim() ? '#d1d5db' : '#a6192e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: loading || !file || !title.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    {loading ? 'Uploading...' : 'Upload Notes'}
                </button>
            </form>
        </ModalWrapper>
    );
}

// Share Tips Modal
export function ShareTipsModal({ isOpen, onClose, courseCode, onSuccess }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;

        setLoading(true);
        setError('');

        try {
            const token = await getToken();
            await createContribution({
                courseCode,
                type: 'tip',
                title: title.trim(),
                body: body.trim(),
                displayName: user?.fullName || user?.username || 'Anonymous'
            }, token);

            onSuccess?.();
            onClose();
            setTitle('');
            setBody('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Share a Tip" icon={MessageSquare}>
            <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Start assignments early"
                        required
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '6px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </label>

                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Your Tip</span>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share your advice for succeeding in this course..."
                        required
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '6px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            outline: 'none',
                            resize: 'vertical'
                        }}
                    />
                </label>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} color="#dc2626" />
                        <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !title.trim() || !body.trim()}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: loading || !title.trim() || !body.trim() ? '#d1d5db' : '#a6192e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: loading || !title.trim() || !body.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                    {loading ? 'Submitting...' : 'Share Tip'}
                </button>
            </form>
        </ModalWrapper>
    );
}

// Recommend Resource Modal
export function RecommendResourceModal({ isOpen, onClose, courseCode, onSuccess }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateUrl = (urlString) => {
        try {
            new URL(urlString);
            return urlString.startsWith('http://') || urlString.startsWith('https://');
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        if (!validateUrl(url)) {
            setError('Please enter a valid URL starting with http:// or https://');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = await getToken();
            await createContribution({
                courseCode,
                type: 'resource',
                title: title.trim(),
                url: url.trim(),
                displayName: user?.fullName || user?.username || 'Anonymous'
            }, token);

            onSuccess?.();
            onClose();
            setTitle('');
            setUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Recommend a Resource" icon={Link2}>
            <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Great YouTube series on Data Structures"
                        required
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '6px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </label>

                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>URL</span>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(''); }}
                        placeholder="https://..."
                        required
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '6px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </label>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} color="#dc2626" />
                        <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !title.trim() || !url.trim()}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: loading || !title.trim() || !url.trim() ? '#d1d5db' : '#a6192e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: loading || !title.trim() || !url.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Link2 size={20} />}
                    {loading ? 'Submitting...' : 'Recommend Resource'}
                </button>
            </form>
        </ModalWrapper>
    );
}
