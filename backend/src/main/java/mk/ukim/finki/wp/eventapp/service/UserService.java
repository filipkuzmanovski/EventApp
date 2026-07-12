package mk.ukim.finki.wp.eventapp.service;

import mk.ukim.finki.wp.eventapp.Repository.UserRepository;
import mk.ukim.finki.wp.eventapp.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // The one account that gets ADMIN on registration
    @Value("${eventapp.admin.username}")
    private String adminUsername;

    /** @throws IllegalArgumentException with a user-facing message on invalid input */
    public User register(String email, String username, String password) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            throw new IllegalArgumentException("Внесете валиден е-маил.");
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Корисничкото име е задолжително.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Лозинката мора да има барем 6 карактери.");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Корисничкото име е зафатено.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Веќе постои профил со овој е-маил.");
        }

        User user = new User();
        user.setEmail(email.trim());
        user.setUsername(username.trim());
        user.setPassword(encoder.encode(password));
        user.setRole(username.trim().equalsIgnoreCase(adminUsername) ? "ADMIN" : "USER");
        return userRepository.save(user);
    }

    /** Returns the user when username + password match, empty otherwise. */
    public Optional<User> login(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        return userRepository.findByUsernameIgnoreCase(username.trim())
                .filter(user -> encoder.matches(password, user.getPassword()));
    }
}
