package ch.bbw.pr.tresorbackend.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class PasswordEncryptService {
    // Pepper fest im Code (Sicherheit durch Trennung von DB und Code)
    private static final String PEPPER = "SuperSecretPepperForSchoolProject!";
    private static final int BCRYPT_COST = 12;

    public String hashPassword(String password) {
        String pwdWithPepper = password + PEPPER;
        // BCrypt generiert den Salt automatisch und speichert ihn im Hash-String
        return BCrypt.hashpw(pwdWithPepper, BCrypt.gensalt(BCRYPT_COST));
    }

    public boolean doPasswordMatch(String rawPassword, String hashedPassword) {
        String rawWithPepper = rawPassword + PEPPER;
        return BCrypt.checkpw(rawWithPepper, hashedPassword);
    }
}