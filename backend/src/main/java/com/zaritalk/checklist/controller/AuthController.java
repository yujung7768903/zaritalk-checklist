package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.dto.KakaoLoginRequest;
import com.zaritalk.checklist.dto.LoginResponse;
import com.zaritalk.checklist.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        LoginResponse response = kakaoAuthService.login(request.accessToken());
        return ResponseEntity.ok(response);
    }
}
