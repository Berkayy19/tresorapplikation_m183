package ch.bbw.pr.tresorbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class CaptchaService {
    @Value("${google.recaptcha.secret}")
    private String recaptchaSecret;

    private static final String GOOGLE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCaptcha(String captchaToken) {
        if (captchaToken == null || captchaToken.isEmpty()) return false;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = GOOGLE_VERIFY_URL + "?secret=" + recaptchaSecret + "&response=" + captchaToken;
            Map response = restTemplate.postForObject(url, null, Map.class);
            return response != null && (Boolean) response.get("success");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}