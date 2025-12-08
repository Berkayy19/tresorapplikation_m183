package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.*;
import ch.bbw.pr.tresorbackend.service.SecretService;
import ch.bbw.pr.tresorbackend.service.UserService;
import ch.bbw.pr.tresorbackend.util.EncryptUtil;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("api/secrets")
public class SecretController {

    private SecretService secretService;
    private UserService userService;

    // Create Secret
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping
    public ResponseEntity<String> createSecret(@Valid @RequestBody NewSecret newSecret, BindingResult bindingResult) throws Exception {
        if (bindingResult.hasErrors()) {
            // simplified error handling for brevity
            return ResponseEntity.badRequest().body("Validation failed");
        }

        User user = userService.findByEmail(newSecret.getEmail());
        if (user == null) return ResponseEntity.notFound().build();

        // 1. Generate a UNIQUE Salt for this specific secret
        String uniqueSalt = EncryptUtil.generateSalt();

        // 2. Derive the key using the password + the new salt
        SecretKey key = EncryptUtil.deriveKey(newSecret.getEncryptPassword(), uniqueSalt);

        // 3. Encrypt content
        String encryptedContent = EncryptUtil.encrypt(newSecret.getContent().toString(), key);

        // 4. Save Secret AND Salt to DB
        Secret secret = new Secret(
                null,
                user.getId(),
                encryptedContent,
                uniqueSalt
        );

        secretService.createSecret(secret);

        JsonObject obj = new JsonObject();
        obj.addProperty("answer", "Secret saved");
        return ResponseEntity.accepted().body(new Gson().toJson(obj));
    }

    // Get Secrets by User ID
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/byuserid")
    public ResponseEntity<List<Secret>> getSecretsByUserId(@RequestBody EncryptCredentials credentials) throws Exception {
        List<Secret> secrets = secretService.getSecretsByUserId(credentials.getUserId());
        if (secrets.isEmpty()) return ResponseEntity.notFound().build();

        // Iterate through secrets
        for (Secret secret : secrets) {
            try {
                // 1. Get the salt from the DB for this specific secret
                String dbSalt = secret.getSalt();

                // Safety check for legacy data (if salt is null)
                if (dbSalt == null) {
                    secret.setContent("Error: Legacy secret without salt.");
                    continue;
                }

                // 2. Derive key using the Password + DB Salt
                SecretKey key = EncryptUtil.deriveKey(credentials.getEncryptPassword(), dbSalt);

                // 3. Decrypt
                String decrypted = EncryptUtil.decrypt(secret.getContent(), key);
                secret.setContent(decrypted);

            } catch (Exception e) {
                secret.setContent("not encryptable. Wrong password?");
            }
        }

        return ResponseEntity.ok(secrets);
    }

    // Update Secret (simplified logic showing salt handling)
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PutMapping("{id}")
    public ResponseEntity<String> updateSecret(@PathVariable("id") Long secretId, @Valid @RequestBody NewSecret newSecret) throws Exception {
        Secret dbSecret = secretService.getSecretById(secretId);
        if (dbSecret == null) return ResponseEntity.notFound().build();

        // 1. Generate NEW Salt (it's good practice to rotate salt on update)
        String newSalt = EncryptUtil.generateSalt();

        // 2. Encrypt with new Salt
        SecretKey key = EncryptUtil.deriveKey(newSecret.getEncryptPassword(), newSalt);
        String encryptedContent = EncryptUtil.encrypt(newSecret.getContent().toString(), key);

        // 3. Update DB
        dbSecret.setContent(encryptedContent);
        dbSecret.setSalt(newSalt);

        secretService.updateSecret(dbSecret);

        return ResponseEntity.ok("{\"answer\": \"Secret updated\"}");
    }

    // Delete
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteSecret(@PathVariable("id") Long secretId) {
        secretService.deleteSecret(secretId);
        return new ResponseEntity<>("Secret successfully deleted!", HttpStatus.OK);
    }

    // Get All (Admin view - returns encrypted data)
    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @GetMapping
    public ResponseEntity<List<Secret>> getAllSecrets() {
        return new ResponseEntity<>(secretService.getAllSecrets(), HttpStatus.OK);
    }
}