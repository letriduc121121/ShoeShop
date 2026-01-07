package com.bitis.shoeshop.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    private static final String JWT_COOKIE_NAME = "jwt_token";
    private static final int COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

    /**
     * ✅ FIX: Sử dụng ResponseCookie thay vì Cookie để set SameSite
     */
    public void addJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(JWT_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false)  // Set true nếu dùng HTTPS
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .sameSite("Lax")  // ✅ QUAN TRỌNG: Thêm SameSite
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        System.out.println("✅ JWT Cookie set: " + JWT_COOKIE_NAME);
    }

    public String getJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            System.out.println("❌ No cookies in request");
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (JWT_COOKIE_NAME.equals(cookie.getName())) {
                System.out.println("✅ JWT cookie found: " + cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...");
                return cookie.getValue();
            }
        }

        System.out.println("❌ JWT cookie not found. Available cookies: " + request.getCookies().length);
        return null;
    }

    public void deleteJwtCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(JWT_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        System.out.println("✅ JWT Cookie deleted");
    }
}