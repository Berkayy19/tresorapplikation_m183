package ch.bbw.pr.tresorbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // This generates the constructor automatically
@ToString
@Entity
@Table(name = "secret")
public class Secret {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "user_id")
    private Long userId;

    @Column(nullable = false, name = "content")
    private String content;

    @Column(name = "salt")
    private String salt;

    // REMOVED: The manual constructor is gone because @AllArgsConstructor does it for you.
}