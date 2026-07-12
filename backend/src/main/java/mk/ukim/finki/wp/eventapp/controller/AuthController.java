package mk.ukim.finki.wp.eventapp.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.wp.eventapp.model.AuthDTO;
import mk.ukim.finki.wp.eventapp.model.User;
import mk.ukim.finki.wp.eventapp.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {
    private final UserService userService;

    @Value("${eventapp.admin.token}")
    private String adminToken;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        try {
            User user = userService.register(
                    request.getEmail(), request.getUsername(), request.getPassword());
            return ResponseEntity.ok(toResponse(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthDTO.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        return userService.login(request.getUsername(), request.getPassword())
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthDTO.ErrorResponse("Погрешно корисничко име или лозинка.")));
    }

    private AuthDTO.AuthResponse toResponse(User user) {
        boolean isAdmin = "ADMIN".equals(user.getRole());
        return new AuthDTO.AuthResponse(
                user.getUsername(),
                user.getRole(),
                isAdmin ? adminToken : null);
    }
}
