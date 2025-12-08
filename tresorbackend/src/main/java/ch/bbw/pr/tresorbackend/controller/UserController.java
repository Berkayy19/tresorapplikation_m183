package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.*;
import ch.bbw.pr.tresorbackend.service.CaptchaService;
import ch.bbw.pr.tresorbackend.service.PasswordEncryptService;
import ch.bbw.pr.tresorbackend.service.UserService;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("api/users")
public class UserController {

    private UserService userService;
    private PasswordEncryptService passwordService;
    private CaptchaService captchaService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    // TEMPORARY STORAGE FOR TOKENS
    private static final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody RegisterUser registerUser, BindingResult bindingResult) {
        boolean isCaptchaValid = captchaService.verifyCaptcha(registerUser.getRecaptchaToken());
        if (!isCaptchaValid) {
            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Invalid Captcha. Request denied.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new Gson().toJson(obj));
        }

        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                    .collect(Collectors.toList());
            JsonArray arr = new JsonArray();
            errors.forEach(arr::add);
            JsonObject obj = new JsonObject();
            obj.add("message", arr);
            return ResponseEntity.badRequest().body(new Gson().toJson(obj));
        }

        User user = new User(
                null,
                registerUser.getFirstName(),
                registerUser.getLastName(),
                registerUser.getEmail(),
                passwordService.hashPassword(registerUser.getPassword())
        );

        User savedUser = userService.createUser(user);
        JsonObject obj = new JsonObject();
        obj.addProperty("answer", savedUser != null ? "User saved" : "User not saved");
        return ResponseEntity.accepted().body(new Gson().toJson(obj));
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> doLoginUser(@RequestBody LoginUser loginUser) {
        User user = userService.findByEmail(loginUser.getEmail());
        if (user != null && passwordService.doPasswordMatch(loginUser.getPassword(), user.getPassword())) {
            return ResponseEntity.ok(new LoginResponse("Login successful", user.getId()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid credentials", null));
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/byemail")
    public ResponseEntity<String> getUserIdByEmail(@RequestBody EmailAdress email) {
        User user = userService.findByEmail(email.getEmail());
        if(user == null) return ResponseEntity.badRequest().body("{}");
        JsonObject obj = new JsonObject();
        obj.addProperty("answer", user.getId());
        return ResponseEntity.accepted().body(new Gson().toJson(obj));
    }

    // --- RESET PASSWORD LOGIC ---

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        User user = userService.findByEmail(email);

        if (user != null) {
            String token = UUID.randomUUID().toString();
            resetTokens.put(token, email);

            System.out.println("==================================================");
            System.out.println("PASSWORD RESET LINK FOR: " + email);
            System.out.println("http://localhost:3000/user/reset-password?token=" + token);
            System.out.println("==================================================");
        }

        JsonObject obj = new JsonObject();
        obj.addProperty("message", "Request processed.");
        return ResponseEntity.ok(new Gson().toJson(obj));
    }

    @CrossOrigin(origins = "${CROSS_ORIGIN}")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("password");

        if (!resetTokens.containsKey(token)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
        }

        String email = resetTokens.get(token);
        User user = userService.findByEmail(email);

        if (user != null) {
            String hashedPassword = passwordService.hashPassword(newPassword);
            user.setPassword(hashedPassword);
            userService.updateUser(user);

            resetTokens.remove(token);

            JsonObject obj = new JsonObject();
            obj.addProperty("message", "Password changed.");
            return ResponseEntity.ok(new Gson().toJson(obj));
        }

        return ResponseEntity.badRequest().body("User not found.");
    }
}