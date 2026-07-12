package mk.ukim.finki.wp.eventapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users") // "user" is a reserved word in Postgres
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    // BCrypt hash — never serialized in responses
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // "ADMIN" or "USER"
    @Column(nullable = false)
    private String role;
}
