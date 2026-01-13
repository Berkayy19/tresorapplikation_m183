package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.*;
import ch.bbw.pr.tresorbackend.repository.SecretRepository;
import ch.bbw.pr.tresorbackend.repository.UserRepository;
import ch.bbw.pr.tresorbackend.util.EncryptUtil;
import ch.bbw.pr.tresorbackend.util.InputSanitizer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.util.List;

@RestController
@RequestMapping("api/secrets")
public class SecretController {

    private final SecretRepository secretRepo;
    private final UserRepository userRepo;
    private final InputSanitizer sanitizer;

    public SecretController(SecretRepository secretRepo, UserRepository userRepo, InputSanitizer sanitizer) {
        this.secretRepo = secretRepo;
        this.userRepo = userRepo;
        this.sanitizer = sanitizer;
    }

    // --- CREATE SECRET ---
    @PostMapping
    public ResponseEntity<?> createSecret(@RequestBody NewSecret newSecret) {
        try {
            // Helper Methode nutzen um User zu finden (egal ob Email oder ID)
            User user = findUserByEmailOrId(newSecret.getEmail());

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found via Email or ID");
            }

            String salt = EncryptUtil.generateSalt();
            String pwdToUse = newSecret.getEncryptPassword() == null ? "" : newSecret.getEncryptPassword();
            SecretKey key = EncryptUtil.deriveKey(pwdToUse, salt);

            String cleanContent = sanitizer.sanitize(newSecret.getContent().toString());
            String encrypted = EncryptUtil.encrypt(cleanContent, key);

            Secret secret = new Secret(null, user.getId(), encrypted, salt);
            secretRepo.save(secret);

            return ResponseEntity.ok("{\"answer\": \"Secret saved\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error saving secret: " + e.getMessage());
        }
    }

    // --- GET SECRETS ---
    @PostMapping("/byuserid")
    public ResponseEntity<List<Secret>> getSecrets(@RequestBody EncryptCredentials creds) {
        // Hier kommt jetzt "a@a" (Email) oder "1" (ID) als String an
        User user = findUserByEmailOrId(creds.getUserId());

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        // Wir nutzen die echte ID aus der Datenbank
        List<Secret> secrets = secretRepo.findByUserId(user.getId());

        for (Secret s : secrets) {
            try {
                if (s.getSalt() == null) continue;

                String pwdToUse = creds.getEncryptPassword() == null ? "" : creds.getEncryptPassword();
                SecretKey key = EncryptUtil.deriveKey(pwdToUse, s.getSalt());

                String decrypted = EncryptUtil.decrypt(s.getContent(), key);
                s.setContent(decrypted);
            } catch (Exception e) {
                s.setContent("--- Encrypted (Wrong Password) ---");
            }
        }
        return ResponseEntity.ok(secrets);
    }

    // --- DELETE SECRET ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSecret(@PathVariable Long id) {
        secretRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // --- HELPER METHODE ---
    private User findUserByEmailOrId(String lookup) {
        if (lookup == null) return null;

        // 1. Versuch: Suche nach Email
        User user = userRepo.findByEmail(lookup).orElse(null);

        // 2. Versuch: Wenn nicht gefunden, ist es vielleicht eine ID?
        if (user == null) {
            try {
                Long id = Long.parseLong(lookup);
                user = userRepo.findById(id).orElse(null);
            } catch (NumberFormatException e) {
                // War keine Zahl, also auch keine ID.
            }
        }
        return user;
    }
}