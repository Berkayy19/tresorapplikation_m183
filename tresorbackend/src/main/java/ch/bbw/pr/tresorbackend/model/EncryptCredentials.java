package ch.bbw.pr.tresorbackend.model;

import lombok.Data;

@Data
public class EncryptCredentials {
    // WICHTIG: String statt Long, damit wir auch Emails empfangen können
    private String userId;

    private String email;
    private String encryptPassword;
}