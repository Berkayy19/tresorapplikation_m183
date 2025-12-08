import '../../App.css';
import React, { useCallback, useEffect, useState } from 'react';
import { getSecretsforUser } from "../../comunication/FetchSecrets";

/**
 * Secrets
 */
const Secrets = ({ loginValues }) => {
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionBusyId, setActionBusyId] = useState(null);

    const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

    const parseContent = (content) => {
        try {
            const parsed = JSON.parse(content);
            return parsed.kind ? parsed : { data: content };
        } catch {
            return { data: content };
        }
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
        if (loginValues?.email) {
            loadSecrets();
        }
    }, [loginValues, loadSecrets]);

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

    if (!loginValues?.email) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                Bitte zuerst einloggen, um Secrets anzuzeigen.
            </div>
        );
    }

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
                                <p><strong>User ID:</strong> {secret.userId}</p>

                                {parsedContent.kind && <p><strong>Type:</strong> {parsedContent.kind}</p>}
                                {parsedContent.title && <p><strong>Title:</strong> {parsedContent.title}</p>}
                                {parsedContent.content && <p><strong>Content:</strong> {parsedContent.content}</p>}

                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        onClick={() => handleDelete(secret.id)}
                                        disabled={busy}
                                        style={{ backgroundColor: '#e74c3c', color: 'white' }}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default Secrets;
