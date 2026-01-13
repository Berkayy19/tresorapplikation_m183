package ch.bbw.pr.tresorbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "secrets")
public class Secret {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Zurück zu Long

    private Long userId; // Auch der Fremdschlüssel ist wieder Long

    @Column(length = 5000) // Längeren Text erlauben für Verschlüsselung
    private String content;

    private String salt;
}