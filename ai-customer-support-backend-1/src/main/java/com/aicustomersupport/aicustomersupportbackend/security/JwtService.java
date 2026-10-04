package com.aicustomersupport.aicustomersupportbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must contain at least 32 characters."
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationMs = expirationMs;
    }


    /**
     * Generate JWT containing user identity and role.
     */
    public String generateToken(
            Long userId,
            String email,
            String role
    ) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + expirationMs
        );

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }


    /**
     * Extract email (JWT subject).
     */
    public String extractEmail(String token) {

        return extractAllClaims(token)
                .getSubject();
    }


    /**
     * Extract user ID.
     */
    public Long extractUserId(String token) {

        Object value = extractAllClaims(token)
                .get("userId");

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.valueOf(value.toString());
    }


    /**
     * Extract role.
     */
    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }


    /**
     * Validate token against the authenticated email.
     */
    public boolean isTokenValid(
            String token,
            String email
    ) {

        try {

            String tokenEmail = extractEmail(token);

            return tokenEmail.equals(email)
                    && !isTokenExpired(token);

        } catch (Exception ex) {

            return false;
        }
    }


    /**
     * Check whether JWT has expired.
     */
    private boolean isTokenExpired(String token) {

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }


    /**
     * Parse and extract JWT claims.
     */
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}