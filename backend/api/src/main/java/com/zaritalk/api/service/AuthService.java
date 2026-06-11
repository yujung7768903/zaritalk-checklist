package com.zaritalk.api.service;

import com.zaritalk.api.controller.response.LoginResponse;
import com.zaritalk.api.infrastructure.kakao.KakaoApiClient;
import com.zaritalk.api.infrastructure.kakao.dto.KakaoUserInfo;
import com.zaritalk.core.domain.User;
import com.zaritalk.core.service.UserCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 로그인/회원가입 처리 서비스.
 * 카카오 인증 결과를 바탕으로 사용자를 조회/생성하고 JWT를 발급한다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final KakaoApiClient kakaoApiClient;
    private final UserCommandService userCommandService;
    private final JwtService jwtService;

    /**
     * 카카오 로그인 페이지 URL을 조회한다.
     */
    public String getKakaoAuthorizationUrl() {
        return kakaoApiClient.getAuthorizationUrl();
    }

    /**
     * 인가 코드로 카카오 로그인을 처리하고 JWT를 반환한다.
     *
     * @param code 카카오 인가 코드
     * @return 로그인 응답 (userPk, nickname, JWT 토큰)
     */
    public LoginResponse loginWithKakaoCode(String code) {
        String accessToken = kakaoApiClient.exchangeCodeForToken(code);
        KakaoUserInfo kakaoUser = kakaoApiClient.fetchUserInfo(accessToken);
        User user = userCommandService.findOrCreate(kakaoUser.id(), kakaoUser.nickname());
        String token = jwtService.generateToken(user.getPk());
        return new LoginResponse(user.getPk(), user.getNickname(), token);
    }
}
