package com.zaritalk.checklist.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zaritalk.checklist.domain.User;
import com.zaritalk.checklist.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 카카오 OAuth 인증 서비스
 * 인가 코드 → 액세스 토큰 → 사용자 정보 조회 → 로그인/회원가입 처리
 */
@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_ME_URL = "https://kapi.kakao.com/v2/user/me";

    @Value("${kakao.rest-api-key}")
    private String restApiKey;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri:http://localhost:5174}")
    private String redirectUri;

    private final UserService userService;
    private final JwtService jwtService;
    private final RestClient restClient = RestClient.create();

    /**
     * 카카오 로그인 페이지 URL 생성
     */
    public String getAuthorizationUrl() {
        return UriComponentsBuilder
                .fromHttpUrl("https://kauth.kakao.com/oauth/authorize")
                .queryParam("client_id", restApiKey)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .build()
                .toUriString();
    }

    /**
     * 인가 코드로 로그인 처리 및 JWT 반환
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
        User user = userService.findOrCreate(kakaoUser.id(), kakaoUser.nickname());
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

        String nickname = response.kakaoAccount() != null
                && response.kakaoAccount().profile() != null
                ? response.kakaoAccount().profile().nickname()
                : "사용자";

        return new KakaoUserInfo(response.id(), nickname);
    }

    private record KakaoUserInfo(Long id, String nickname) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TokenResponse(@JsonProperty("access_token") String accessToken) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record KakaoUserInfoResponse(
            Long id,
            @JsonProperty("kakao_account") KakaoAccount kakaoAccount
    ) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        record KakaoAccount(KakaoProfile profile) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        record KakaoProfile(String nickname) {}
    }
}
