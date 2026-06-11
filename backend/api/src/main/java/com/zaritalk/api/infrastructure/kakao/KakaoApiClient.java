package com.zaritalk.api.infrastructure.kakao;

import com.zaritalk.api.infrastructure.kakao.dto.KakaoTokenResponse;
import com.zaritalk.api.infrastructure.kakao.dto.KakaoUserInfo;
import com.zaritalk.api.infrastructure.kakao.dto.KakaoUserInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 카카오 OAuth API 클라이언트.
 * 인가 URL 생성, 토큰 교환, 사용자 정보 조회를 담당한다.
 */
@Component
public class KakaoApiClient {

    private static final String KAKAO_TOKEN_URL    = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_ME_URL  = "https://kapi.kakao.com/v2/user/me";
    private static final String KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

    @Value("${kakao.rest-api-key}")
    private String restApiKey;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri:http://localhost:5174}")
    private String redirectUri;

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
     * 인가 코드를 액세스 토큰으로 교환한다.
     *
     * @param code 카카오 인가 코드
     * @return 액세스 토큰
     */
    public String exchangeCodeForToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", restApiKey);
        formData.add("client_secret", clientSecret);
        formData.add("redirect_uri", redirectUri);
        formData.add("code", code);

        KakaoTokenResponse tokenResponse = restClient.post()
                .uri(KAKAO_TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(KakaoTokenResponse.class);

        if (tokenResponse == null || tokenResponse.accessToken() == null) {
            throw new IllegalStateException("카카오 토큰을 받을 수 없습니다.");
        }
        return tokenResponse.accessToken();
    }

    /**
     * 액세스 토큰으로 카카오 사용자 정보를 조회한다.
     *
     * @param accessToken 카카오 액세스 토큰
     * @return 카카오 사용자 정보 (id, nickname)
     */
    public KakaoUserInfo fetchUserInfo(String accessToken) {
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
}
