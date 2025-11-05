package ch.bbw.pr.tresorbackend.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

/**
 * Password encryption service using BCrypt with pepper
 */
@Service
public class PasswordEncryptService {

    private static final String PEPPER = "SuperSecretPepper123!";
    private static final int BCRYPT_COST = 12;

    public PasswordEncryptService() { }

    public String hashPassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("password must not be null");
        }

        String pwdWithPepper = password + PEPPER;
        String salt = BCrypt.gensalt(BCRYPT_COST);

        return BCrypt.hashpw(pwdWithPepper, salt);
    }

    public boolean doPasswordMatch(String password, String hashedPassword) {
        if (password == null || hashedPassword == null) {
            return false;
        }

        String rawWithPepper = password + PEPPER;

        try {
            return BCrypt.checkpw(rawWithPepper, hashedPassword);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
