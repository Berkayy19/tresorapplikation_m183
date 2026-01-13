package ch.bbw.pr.tresorbackend.configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }
            // Liest firebase-key.json aus resources
            InputStream serviceAccount = new ClassPathResource("firebase-key.json").getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println(">>> Firebase Admin SDK initialized.");
        } catch (Exception e) {
            System.err.println("!!! Firebase init failed (File missing?): " + e.getMessage());
        }
    }
}