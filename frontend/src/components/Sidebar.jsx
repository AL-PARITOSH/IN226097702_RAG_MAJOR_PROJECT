import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, Trash2, CheckCircle, Loader2, FileText, X } from 'lucide-react';
import { uploadFiles, clearWorkspace, resolveTicket } from '../api';

const Sidebar = ({ sessionId, setSessionId, uploadedFiles, setUploadedFiles, tickets, fetchTickets, isOpen, closeSidebar }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFiles = async (files) => {
        if (!files.length) return;
        setIsUploading(true);
        try {
            const data = await uploadFiles(sessionId, files);
            setUploadedFiles(prev => {
                const newFiles = [...prev];
                data.uploaded_files.forEach(file => {
                    if (!newFiles.includes(file)) newFiles.push(file);
                });
                return newFiles;
            });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Make sure backend is running.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileUpload = (e) => handleFiles(e.target.files);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClear = async () => {
        try {
            await clearWorkspace(sessionId);
            setSessionId(crypto.randomUUID());
            setUploadedFiles([]);
        } catch (error) {
            console.error("Clear failed", error);
        }
    };

    const handleResolve = async (ticketId) => {
        try {
            await resolveTicket(ticketId, "Resolved by simulated agent");
            fetchTickets();
        } catch (error) {
            console.error("Resolve failed", error);
        }
    };

    return (
        <div className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <button 
                    className="btn btn-outline" 
                    style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px' }}
                    onClick={closeSidebar}
                >
                    <X size={16} />
                </button>
            )}

            <div className="sidebar-section">
                <h3>Workspace</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Session: <span style={{ color: 'var(--accent-color)' }}>{sessionId.substring(0,8)}</span>
                </p>
                
                {isUploading ? (
                    <div className="dropzone">
                        <Loader2 className="animate-spin dropzone-icon" size={28} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Processing & Indexing...</span>
                    </div>
                ) : (
                    <div 
                        className={`dropzone ${isDragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf" 
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <UploadCloud className="dropzone-icon" size={24} />
                        <div style={{ fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click to upload</span> or drag and drop
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PDF files only</div>
                    </div>
                )}

                {uploadedFiles.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '4px' }}>Indexed Documents</h3>
                        {uploadedFiles.map(f => (
                            <div key={f} className="doc-card">
                                <FileText className="doc-icon" size={16} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="sidebar-section" style={{ marginTop: 'auto' }}>
                {tickets && tickets.length > 0 && (
                    <>
                        <h3 style={{ color: 'var(--warning)' }}>Pending Escalations ({tickets.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {tickets.map(t => (
                                <div key={t.ticket_id} className="doc-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Query:</strong> {t.query}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.intent}</span>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ fontSize: '0.75rem', padding: '4px 8px', borderColor: 'var(--success)', color: 'var(--success)' }}
                                            onClick={() => handleResolve(t.ticket_id)}
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                <button className="btn btn-danger" onClick={handleClear} style={{ marginTop: '16px' }}>
                    <Trash2 size={16} /> Clear Workspace
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
