package com.bitis.shoeshop.controller;

import com.bitis.shoeshop.dto.AuthResponse;
import com.bitis.shoeshop.dto.LoginRequest;
import com.bitis.shoeshop.dto.RegisterRequest;
import com.bitis.shoeshop.dto.MessageResponse;
import com.bitis.shoeshop.service.AuthService;
import com.bitis.shoeshop.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);

        // Set JWT in HttpOnly cookie
        cookieUtil.addJwtCookie(response, authResponse.getToken());

        // Don't send token in response body for security
//        authResponse.setToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        // Set JWT in HttpOnly cookie
        cookieUtil.addJwtCookie(response, authResponse.getToken());

        // Don't send token in response body for security
//        authResponse.setToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletResponse response) {
        cookieUtil.deleteJwtCookie(response);
        // ✅ FIX: Trả về JSON thay vì String
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }
}