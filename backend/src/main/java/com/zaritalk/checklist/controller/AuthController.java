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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoAuthService kakaoAuthService;

    @GetMapping("/kakao/url")
    public ResponseEntity<Map<String, String>> getKakaoAuthUrl() {
        return ResponseEntity.ok(Map.of("authUrl", kakaoAuthService.getAuthorizationUrl()));
    }

    @PostMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        LoginResponse response = kakaoAuthService.loginWithCode(request.code());
        return ResponseEntity.ok(response);
    }
}
