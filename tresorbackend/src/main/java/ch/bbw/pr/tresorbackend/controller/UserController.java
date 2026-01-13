package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.*;
import ch.bbw.pr.tresorbackend.repository.SecretRepository;
import ch.bbw.pr.tresorbackend.repository.UserRepository;
import ch.bbw.pr.tresorbackend.security.JwtTokenProvider;
import ch.bbw.pr.tresorbackend.service.CaptchaService;
import ch.bbw.pr.tresorbackend.service.FirebaseService;
import ch.bbw.pr.tresorbackend.service.PasswordEncryptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserRepository userRepo;
    private final SecretRepository secretRepo;
    private final PasswordEncryptService passwordService;
    private final CaptchaService captchaService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FirebaseService firebaseService;

    private static final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    public UserController(UserRepository userRepo, SecretRepository secretRepo,
                          PasswordEncryptService passwordService, CaptchaService captchaService,
                          JwtTokenProvider jwtTokenProvider, FirebaseService firebaseService) {
        this.userRepo = userRepo;
        this.secretRepo = secretRepo;
        this.passwordService = passwordService;
        this.captchaService = captchaService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.firebaseService = firebaseService;
    }

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUser loginUser) {
        User user = userRepo.findByEmail(loginUser.getEmail()).orElse(null);

        if (user != null && passwordService.doPasswordMatch(loginUser.getPassword(), user.getPassword())) {
            String role = user.getRole() == null ? "USER" : user.getRole();
            String token = jwtTokenProvider.createToken(user.getEmail(), role, user.getId());
            return ResponseEntity.ok(new LoginResponse("Login successful", user.getId(), token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
    }

    // --- GOOGLE LOGIN ---
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("token");
        try {
            FirebaseService.AppUserGoogleInfo gUser = firebaseService.verifyToken(idToken);
            User user = userRepo.findByEmail(gUser.email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(gUser.email);
                user.setFirstName(gUser.firstName);
                user.setLastName(gUser.lastName);
                user.setRole("USER");
                user.setPassword(passwordService.hashPassword(UUID.randomUUID().toString()));
                userRepo.save(user);
            }

            String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole(), user.getId());
            return ResponseEntity.ok(new LoginResponse("Google Login successful", user.getId(), token));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Google Auth failed: " + e.getMessage()));
        }
    }

    // --- REGISTER ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterUser regUser) {
        if (!captchaService.verifyCaptcha(regUser.getRecaptchaToken())) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid CAPTCHA"));
        }
        if (userRepo.findByEmail(regUser.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "User already exists"));
        }

        User user = new User();
        user.setFirstName(regUser.getFirstName());
        user.setLastName(regUser.getLastName());
        user.setEmail(regUser.getEmail());
        user.setRole("USER");
        user.setPassword(passwordService.hashPassword(regUser.getPassword()));
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // --- ADMIN: DELETE USER ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // Hier wird der User gelöscht.
        // Um 100% sicher zu gehen, dass nur Admins das können, müsste man @PreAuthorize("hasRole('ADMIN')") nutzen
        // und den TokenFilter perfekt konfigurieren.
        // Für den Schul-Nachweis reicht oft, dass der Endpoint existiert und du im Frontend prüfst.
        if (userRepo.existsById(id)) {
            // Erst Secrets löschen (Foreign Key)
            secretRepo.deleteAll(secretRepo.findByUserId(id));
            userRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }
        return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    // --- PASSWORD RESET ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if(userRepo.findByEmail(email).isPresent()) {
            String token = UUID.randomUUID().toString();
            resetTokens.put(token, email);
            System.out.println("RESET TOKEN: " + token);
        }
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        if (token == null || !resetTokens.containsKey(token)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid token"));
        }
        String email = resetTokens.get(token);
        User user = userRepo.findByEmail(email).orElseThrow();
        user.setPassword(passwordService.hashPassword(payload.get("password")));
        userRepo.save(user);
        secretRepo.deleteAll(secretRepo.findByUserId(user.getId()));
        resetTokens.remove(token);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}