import '../../App.css';
import React, { useCallback, useEffect, useState } from 'react';
import { getSecretsforUser } from "../../comunication/FetchSecrets";

/**
 * Secrets
 * @author Peter Rutschmann
 */
const Secrets = ({ loginValues }) => {
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ url: '', userName: '', password: '' });
    const [editPassword, setEditPassword] = useState(''); // Verschlüsselungspasswort, falls nicht im Login vorhanden
    const [actionBusyId, setActionBusyId] = useState(null); // disable buttons per card while saving/deleting

    // Wichtig: API-Basis. Bevorzugt Umgebungsvariable, sonst Standard 8080.
    // Option A (empfohlen): REACT_APP_API_BASE=http://localhost:8080 setzen
    // Option B: in package.json "proxy": "http://localhost:8080" und apiBase = '' setzen
    const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

    // Helper: safe JSON parse
    const parseContent = (content) => {
        try {
            return JSON.parse(content);
        } catch {
            return { data: content };
        }
    };

    // API helpers
    const updateSecretOnServer = async (id, payload) => {
        const res = await fetch(`${apiBase}/api/secrets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
        }
        return res;
    };

    const deleteSecretOnServer = async (id) => {
        const res = await fetch(`${apiBase}/api/secrets/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
        }
        return res;
    };

    const loadSecrets = useCallback(async () => {
        setErrorMessage('');
        setLoading(true);
        try {
            if (!loginValues?.email) {
                console.error('Secrets: No valid email, please do login first:' + loginValues);
                setErrorMessage("No valid email, please do login first.");
                setSecrets([]);
                return;
            }
            const data = await getSecretsforUser(loginValues);
            setSecrets(data || []);
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message || 'Fehler beim Laden der Secrets.');
            setSecrets([]);
        } finally {
            setLoading(false);
        }
    }, [loginValues]);

    useEffect(() => {
        loadSecrets();
    }, [loadSecrets]);

    // UI Handlers
    const handleEditClick = (secret) => {
        const parsed = parseContent(secret.content);
        setEditingId(secret.id);
        setEditForm({
            url: parsed.url || '',
            userName: parsed.userName || '',
            password: parsed.password || '',
        });
        // vorbefüllen, falls Login schon ein encryptPassword mitbringt
        setEditPassword(loginValues?.encryptPassword || '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ url: '', userName: '', password: '' });
        setEditPassword('');
    };

    const handleSaveEdit = async (secretId) => {
        if (!loginValues?.email) {
            setErrorMessage('Login erforderlich (E-Mail).');
            return;
        }
        const encryptPassword = loginValues?.encryptPassword || editPassword;
        if (!encryptPassword) {
            setErrorMessage('Bitte Verschlüsselungspasswort eingeben.');
            return;
        }
        try {
            setActionBusyId(secretId);
            setErrorMessage('');
            const payload = {
                email: loginValues.email,
                encryptPassword,
                content: {
                    // Nur Felder mitschicken, die gesetzt sind
                    ...(editForm.url ? { url: editForm.url } : {}),
                    ...(editForm.userName ? { userName: editForm.userName } : {}),
                    ...(editForm.password ? { password: editForm.password } : {}),
                },
            };
            await updateSecretOnServer(secretId, payload);
            await loadSecrets();
            handleCancelEdit();
        } catch (e) {
            console.error('Update fehlgeschlagen:', e);
            setErrorMessage(
                typeof e?.message === 'string' && e.message.trim().length > 0
                    ? e.message
                    : 'Update fehlgeschlagen.'
            );
        } finally {
            setActionBusyId(null);
        }
    };

    const handleDelete = async (secretId) => {
        const ok = window.confirm('Dieses Secret wirklich löschen?');
        if (!ok) return;

        try {
            setActionBusyId(secretId);
            setErrorMessage('');
            await deleteSecretOnServer(secretId);
            await loadSecrets();
        } catch (e) {
            console.error('Löschen fehlgeschlagen:', e);
            setErrorMessage(
                typeof e?.message === 'string' && e.message.trim().length > 0
                    ? e.message
                    : 'Löschen fehlgeschlagen.'
            );
        } finally {
            setActionBusyId(null);
        }
    };

    return (
        <>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>My Secrets 🔒</h1>

            {errorMessage && (
                <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
                    {errorMessage}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Lädt...
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    padding: '0 20px',
                }}
            >
                {(!secrets || secrets.length === 0) && !loading ? (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>No secrets available</p>
                ) : (
                    secrets.map((secret) => {
                        const parsedContent = parseContent(secret.content);
                        const isEditing = editingId === secret.id;
                        const busy = actionBusyId === secret.id;

                        return (
                            <div
                                key={secret.id}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    wordWrap: 'break-word',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>Secret ID: {secret.id}</h3>
                                <p>
                                    <strong>User ID:</strong> {secret.userId}
                                </p>

                                {!isEditing ? (
                                    <>
                                        {parsedContent.data && (
                                            <p>
                                                <strong>Encrypted:</strong> {parsedContent.data}
                                            </p>
                                        )}
                                        {parsedContent.url && (
                                            <p>
                                                <strong>URL:</strong> {parsedContent.url}
                                            </p>
                                        )}
                                        {parsedContent.userName && (
                                            <p>
                                                <strong>Username:</strong> {parsedContent.userName}
                                            </p>
                                        )}
                                        {parsedContent.password && (
                                            <p>
                                                <strong>Password:</strong> {parsedContent.password}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => handleEditClick(secret)}
                                                disabled={busy}
                                            >
                                                Bearbeiten
                                            </button>
                                            <button
                                                onClick={() => handleDelete(secret.id)}
                                                disabled={busy}
                                                style={{ backgroundColor: '#e74c3c', color: 'white' }}
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span>URL</span>
                                            <input
                                                type="text"
                                                value={editForm.url}
                                                onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                                                placeholder="https://example.com"
                                            />
                                        </label>
                                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span>Username</span>
                                            <input
                                                type="text"
                                                value={editForm.userName}
                                                onChange={(e) => setEditForm((f) => ({ ...f, userName: e.target.value }))}
                                                placeholder="max.mustermann"
                                            />
                                        </label>
                                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span>Password</span>
                                            <input
                                                type="text"
                                                value={editForm.password}
                                                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                                                placeholder="••••••••"
                                            />
                                        </label>

                                        {/* Verschlüsselungspasswort nur anzeigen, wenn es nicht schon im Login vorhanden ist */}
                                        {!loginValues?.encryptPassword && (
                                            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span>Verschlüsselungspasswort</span>
                                                <input
                                                    type="password"
                                                    value={editPassword}
                                                    onChange={(e) => setEditPassword(e.target.value)}
                                                    placeholder="Passwort zum Ver-/Entschlüsseln"
                                                />
                                            </label>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => handleSaveEdit(secret.id)}
                                                disabled={busy || !loginValues?.email}
                                                style={{ backgroundColor: '#2ecc71', color: 'white' }}
                                            >
                                                Speichern
                                            </button>
                                            <button onClick={handleCancelEdit} disabled={busy}>
                                                Abbrechen
                                            </button>
                                            <button
                                                onClick={() => handleDelete(secret.id)}
                                                disabled={busy}
                                                style={{ marginLeft: 'auto', backgroundColor: '#e74c3c', color: 'white' }}
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default Secrets;