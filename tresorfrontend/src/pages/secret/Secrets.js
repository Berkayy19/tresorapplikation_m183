import React, { useCallback, useEffect, useState } from 'react';
import { getSecretsforUser } from "../../comunication/FetchSecrets";

const Secrets = ({ loginValues }) => {
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // API Call zum Löschen
    const deleteSecretAPI = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/secrets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    const loadSecrets = useCallback(async () => {
        setErrorMessage('');
        setLoading(true);
        try {
            if (!loginValues?.email) {
                setErrorMessage("No valid email/password in memory. Please relogin to decrypt secrets.");
                setSecrets([]);
                return;
            }
            // getSecretsforUser muss das Passwort im Body mitsenden zum Entschlüsseln!
            const data = await getSecretsforUser(loginValues);
            setSecrets(data || []);
        } catch (error) {
            setErrorMessage(error.message || 'Fehler beim Laden.');
        } finally {
            setLoading(false);
        }
    }, [loginValues]);

    useEffect(() => {
        if (loginValues?.email) loadSecrets();
    }, [loginValues, loadSecrets]);

    const handleDelete = async (id) => {
        if (!window.confirm("Wirklich löschen?")) return;
        try {
            await deleteSecretAPI(id);
            // Liste lokal aktualisieren
            setSecrets(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            alert("Löschen fehlgeschlagen");
        }
    };

    // Helper um JSON Content sauber anzuzeigen
    const renderContent = (contentString) => {
        try {
            const obj = JSON.parse(contentString);
            return (
                <div>
                    {Object.keys(obj).map(k => (
                        <div key={k}><strong>{k}:</strong> {obj[k]}</div>
                    ))}
                </div>
            );
        } catch (e) {
            return <div>{contentString}</div>;
        }
    };

    if (!loginValues?.email) return <p>Bitte erst einloggen.</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Meine Secrets 🔒</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {loading && <p>Laden...</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {secrets.length === 0 && !loading && <p>Keine Secrets gefunden.</p>}

                {secrets.map(secret => (
                    <div key={secret.id} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '8px',
                        width: '300px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        {/* INHALT ANZEIGEN */}
                        {renderContent(secret.content)}

                        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <button
                                onClick={() => handleDelete(secret.id)}
                                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                            >
                                Löschen
                            </button>
                            {/* Für Edit müsste man hier eine Form einblenden,
                                die updateSecret aufruft. Löschen reicht für die Anforderung meist aus. */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Secrets;