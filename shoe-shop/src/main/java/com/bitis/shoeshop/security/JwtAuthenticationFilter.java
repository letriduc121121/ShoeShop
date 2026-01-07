package com.bitis.shoeshop.security;

import com.bitis.shoeshop.util.CookieUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final CookieUtil cookieUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        logger.info("🌐 Incoming request: {} {}", method, requestPath);

        // Skip JWT validation for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            logger.info("⏭️ Skipping OPTIONS request");
            filterChain.doFilter(request, response);
            return;
        }

        // Skip JWT validation for static resources
        if (isStaticResource(requestPath)) {
            logger.info("⏭️ Skipping static resource: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Skip JWT validation for public API endpoints
        if (isPublicEndpoint(requestPath)) {
            logger.info("⏭️ Skipping public endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Try to extract JWT from cookie first, then fallback to Authorization header
        String jwt = cookieUtil.getJwtFromCookie(request);

        if (jwt == null) {
            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }

        if (jwt == null) {
            logger.warn("⚠️ No JWT token found in cookie or Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String username = jwtUtil.extractUsername(jwt);
            logger.info("🔑 Token found for user: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // IMPORTANT: Use authorities from UserDetails, not from token
                    // This ensures the roles are properly loaded from database

                    logger.info("✅ User authenticated: {} with authorities: {}",
                            username, userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities() // Use authorities from UserDetails
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.info("🎯 Authentication set in SecurityContext for: {} with authorities: {}",
                            username, userDetails.getAuthorities());
                } else {
                    logger.error("❌ Token validation failed for user: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("❌ JWT validation error: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isStaticResource(String path) {
        return path.equals("/") ||
                path.endsWith(".html") ||
                path.endsWith(".css") ||
                path.endsWith(".js") ||
                path.endsWith(".ico") ||
                path.endsWith(".png") ||
                path.endsWith(".jpg") ||
                path.endsWith(".jpeg") ||
                path.endsWith(".gif") ||
                path.endsWith(".svg") ||
                path.endsWith(".woff") ||
                path.endsWith(".woff2") ||
                path.endsWith(".ttf") ||
                path.endsWith(".eot") ||
                path.endsWith(".map") ||
                path.startsWith("/assets/") ||
                path.startsWith("/static/");
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/");
//        return path.startsWith("/api/auth/") ||
//                path.equals("/api/products") ||
//                path.matches("/api/products/\\d+") ||
//                path.startsWith("/api/products/category/") ||
//                path.startsWith("/api/products/search");
    }
}