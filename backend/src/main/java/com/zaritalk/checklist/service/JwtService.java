package com.zaritalk.checklist.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 서비스 (유효기간 30일)
 */
@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * 사용자 PK로 JWT 토큰 생성
     */
    public String generateToken(Long userPk) {
        return Jwts.builder()
                .claim("pk", userPk)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000))
                .signWith(getKey())
                .compact();
    }

    /**
     * JWT 토큰에서 사용자 PK 추출
     */
    public Long extractUserPk(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("pk", Long.class);
    }
}
