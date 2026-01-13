package ch.bbw.pr.tresorbackend.util;

import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    public String sanitize(String input) {
        if (input == null) return null;
        // Einfacher XSS Schutz: Ersetzt gefährliche Zeichen
        return input.replace("<", "&lt;").replace(">", "&gt;");
    }
}