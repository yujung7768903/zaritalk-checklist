package com.zaritalk.api.controller;

import com.zaritalk.api.controller.request.KakaoLoginRequest;
import com.zaritalk.api.controller.response.LoginResponse;
import com.zaritalk.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 카카오 OAuth 인증 컨트롤러.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 카카오 로그인 URL 조회.
     */
    @GetMapping("/kakao/url")
    public ResponseEntity<Map<String, String>> getKakaoAuthUrl() {
        return ResponseEntity.ok(Map.of("authUrl", authService.getKakaoAuthorizationUrl()));
    }

    /**
     * 카카오 인가 코드로 로그인 처리 및 JWT 발급.
     */
    @PostMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        LoginResponse response = authService.loginWithKakaoCode(request.code());
        return ResponseEntity.ok(response);
    }
}
