/**
 * Fetch methodes for secret api calls
 */

// Hilfsfunktion: Baut die URL zusammen
const getApiUrl = () => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    return `${protocol}://${host}:${port}/api`;
};

// Hilfsfunktion: Holt den Token aus dem Speicher und baut den Header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    // Wenn kein Token da ist, gib ein leeres Objekt zurück (führt dann zu 403, aber crasht nicht sofort)
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 1. Secret speichern (POST)
export const postSecret = async ({loginValues, content}) => {
    const API_URL = getApiUrl();

    // Debug Log
    console.log("Posting Secret for:", loginValues.email);

    try {
        const response = await fetch(`${API_URL}/secrets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader() // <--- WICHTIG: Fügt den Token hinzu!
            },
            body: JSON.stringify({
                // Hinweis: Bei Google Login steckt in "email" oft die UserID (siehe LoginUser.js)
                // Das Backend wurde angepasst, um beides zu verstehen.
                email: String(loginValues.email),
                encryptPassword: loginValues.password,
                content: content
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Server response failed.');
        }

        const data = await response.json();
        console.log('Secret successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Error posting secret:', error.message);
        throw new Error(error.message);
    }
};

// 2. Alle Secrets holen (POST auf /byuserid, da wir filtern wollen)
export const getSecretsforUser = async (loginValues) => {
    const API_URL = getApiUrl();

    // Wir nutzen hier POST, um das Passwort sicher im Body zu senden (nicht in der URL)
    // loginValues.email enthält unsere UserID (oder Email), je nach Login-Art.
    const payload = {
        userId: loginValues.email,
        encryptPassword: loginValues.password
    };

    try {
        const response = await fetch(`${API_URL}/secrets/byuserid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader() // <--- WICHTIG: Token mitsenden!
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Wenn 403/401 kommt, ist meist der Token abgelaufen
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to fetch secrets.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw new Error(error.message);
    }
};