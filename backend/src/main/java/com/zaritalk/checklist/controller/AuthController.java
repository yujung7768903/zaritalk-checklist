package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.dto.KakaoLoginRequest;
import com.zaritalk.checklist.dto.LoginResponse;
import com.zaritalk.checklist.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 카카오 OAuth 인증 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoAuthService kakaoAuthService;

    /**
     * 카카오 로그인 URL 조회
     */
    @GetMapping("/kakao/url")
    public ResponseEntity<Map<String, String>> getKakaoAuthUrl() {
        return ResponseEntity.ok(Map.of("authUrl", kakaoAuthService.getAuthorizationUrl()));
    }

    /**
     * 카카오 인가 코드로 로그인 처리 및 JWT 발급
     */
    @PostMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        LoginResponse response = kakaoAuthService.loginWithCode(request.code());
        return ResponseEntity.ok(response);
    }
}
