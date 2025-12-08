package ch.bbw.pr.tresorbackend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CaptchaService {

    private static final Logger logger = LoggerFactory.getLogger(CaptchaService.class);

    // Reads the value from application.properties: google.recaptcha.secret
    @Value("${google.recaptcha.secret}")
    private String recaptchaSecret;

    private static final String GOOGLE_RECAPTCHA_VERIFY_URL =
            "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCaptcha(String captchaToken) {
        // 1. Check if token is present
        if (!StringUtils.hasText(captchaToken)) {
            logger.warn("CaptchaService: Token is missing or empty.");
            return false;
        }

        try {
            // 2. Prepare the request to Google
            RestTemplate restTemplate = new RestTemplate();
            // We append the secret and the token as query parameters
            String params = "?secret=" + recaptchaSecret + "&response=" + captchaToken;

            // 3. Send request
            RecaptchaResponse response = restTemplate.postForObject(
                    GOOGLE_RECAPTCHA_VERIFY_URL + params, null, RecaptchaResponse.class);

            // 4. Analyze Response
            if (response != null) {
                // --- DEBUG LOGGING: CHECK YOUR CONSOLE FOR THIS ---
                System.out.println("====== GOOGLE RECAPTCHA DEBUG ======");
                System.out.println("Success: " + response.isSuccess());
                System.out.println("Score:   " + response.getScore());
                System.out.println("Action:  " + response.getAction());
                System.out.println("Errors:  " + response.getErrorCodes());
                System.out.println("====================================");

                // If success is false, check your Secret Key in application.properties
                if (!response.isSuccess()) {
                    return false;
                }

                // 5. Check Score
                // On localhost, the score might be low (e.g. 0.1).
                // If you see 0.1 in the console, change the 0.5 below to 0.0 for testing.
                return response.getScore() >= 0.5;
            }
        } catch (Exception e) {
            logger.error("Error during Captcha verification", e);
        }

        return false;
    }

    /**
     * Inner class to map Google's JSON response
     */
    @Data
    static class RecaptchaResponse {
        private boolean success;
        private float score;
        private String action;
        private String challenge_ts;
        private String hostname;

        // Maps "error-codes" from JSON to this list
        @JsonProperty("error-codes")
        private List<String> errorCodes;
    }
}