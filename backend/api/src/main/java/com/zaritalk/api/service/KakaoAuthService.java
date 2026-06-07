package com.zaritalk.api.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zaritalk.api.controller.response.LoginResponse;
import com.zaritalk.core.domain.User;
import com.zaritalk.core.service.UserCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 카카오 OAuth 인증 서비스.
 * 인가 코드 → 액세스 토큰 → 사용자 정보 조회 → 로그인/회원가입 처리 순서로 진행한다.
 */
@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private static final String KAKAO_TOKEN_URL    = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_ME_URL  = "https://kapi.kakao.com/v2/user/me";
    private static final String KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

    @Value("${kakao.rest-api-key}")
    private String restApiKey;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri:http://localhost:5174}")
    private String redirectUri;

    private final UserCommandService userCommandService;
    private final JwtService         jwtService;
    private final RestClient restClient = RestClient.create();

    /**
     * 카카오 로그인 페이지 URL을 생성한다.
     *
     * @return 카카오 OAuth 인가 URL
     */
    public String getAuthorizationUrl() {
        return UriComponentsBuilder
                .fromHttpUrl(KAKAO_AUTHORIZE_URL)
                .queryParam("client_id", restApiKey)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .build()
                .toUriString();
    }

    /**
     * 인가 코드로 카카오 로그인을 처리하고 JWT를 반환한다.
     *
     * @param code 카카오 인가 코드
     * @return 로그인 응답 (userPk, nickname, JWT 토큰)
     */
    public LoginResponse loginWithCode(String code) {
        String accessToken = exchangeCodeForToken(code);
        return loginWithToken(accessToken);
    }

    private String exchangeCodeForToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", restApiKey);
        formData.add("client_secret", clientSecret);
        formData.add("redirect_uri", redirectUri);
        formData.add("code", code);

        TokenResponse tokenResponse = restClient.post()
                .uri(KAKAO_TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(TokenResponse.class);

        if (tokenResponse == null || tokenResponse.accessToken() == null) {
            throw new IllegalStateException("카카오 토큰을 받을 수 없습니다.");
        }
        return tokenResponse.accessToken();
    }

    private LoginResponse loginWithToken(String accessToken) {
        KakaoUserInfo kakaoUser = fetchKakaoUserInfo(accessToken);
        User user = userCommandService.findOrCreate(kakaoUser.id(), kakaoUser.nickname());
        String token = jwtService.generateToken(user.getPk());
        return new LoginResponse(user.getPk(), user.getNickname(), token);
    }

    private KakaoUserInfo fetchKakaoUserInfo(String accessToken) {
        KakaoUserInfoResponse response = restClient.get()
                .uri(KAKAO_USER_ME_URL)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(KakaoUserInfoResponse.class);

        if (response == null) {
            throw new IllegalStateException("카카오 사용자 정보를 가져올 수 없습니다.");
        }

        return new KakaoUserInfo(response.id(), response.getNickname());
    }

    private record KakaoUserInfo(Long id, String nickname) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TokenResponse(@JsonProperty("access_token") String accessToken) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record KakaoUserInfoResponse(
            Long id,
            @JsonProperty("kakao_account") KakaoAccount kakaoAccount
    ) {
        String getNickname() {
            if (kakaoAccount == null || kakaoAccount.profile() == null) return "사용자";
            return kakaoAccount.profile().nickname();
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        record KakaoAccount(KakaoProfile profile) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        record KakaoProfile(String nickname) {}
    }
}
