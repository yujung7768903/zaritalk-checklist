package com.zaritalk.api.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 서비스 (유효기간 30일).
 */
@Component
public class JwtService {

    private static final long TOKEN_VALIDITY_MS = 30L * 24 * 60 * 60 * 1000;

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * 사용자 PK로 JWT 토큰을 생성한다.
     *
     * @param userPk 사용자 PK
     * @return 서명된 JWT 문자열
     */
    public String generateToken(Long userPk) {
        return Jwts.builder()
                .claim("pk", userPk)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY_MS))
                .signWith(getKey())
                .compact();
    }

    /**
     * JWT 토큰에서 사용자 PK를 추출한다.
     * 서명 검증에 실패하면 JwtException을 던진다.
     *
     * @param token JWT 문자열 (Bearer 접두사 없이)
     * @return 사용자 PK
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
