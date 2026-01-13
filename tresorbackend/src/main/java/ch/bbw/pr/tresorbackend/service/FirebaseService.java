package ch.bbw.pr.tresorbackend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    public AppUserGoogleInfo verifyToken(String idToken) throws Exception {
        // Token validieren gegen Google Server
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();
        String name = decodedToken.getName(); // "Max Mustermann"

        String firstName = "Google";
        String lastName = "User";

        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ", 2);
            firstName = parts[0];
            lastName = parts[1];
        }

        return new AppUserGoogleInfo(uid, email, firstName, lastName);
    }

    public static class AppUserGoogleInfo {
        public String uid;
        public String email;
        public String firstName;
        public String lastName;

        public AppUserGoogleInfo(String uid, String email, String f, String l) {
            this.uid = uid; this.email = email; this.firstName = f; this.lastName = l;
        }
    }
}