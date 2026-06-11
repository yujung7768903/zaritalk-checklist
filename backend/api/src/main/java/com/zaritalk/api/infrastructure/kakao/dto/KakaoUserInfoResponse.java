package com.zaritalk.api.infrastructure.kakao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoUserInfoResponse(
        Long id,
        @JsonProperty("kakao_account") KakaoAccount kakaoAccount
) {
    public String getNickname() {
        if (kakaoAccount == null || kakaoAccount.profile() == null) return "사용자";
        return kakaoAccount.profile().nickname();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoAccount(KakaoProfile profile) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoProfile(String nickname) {}
}
