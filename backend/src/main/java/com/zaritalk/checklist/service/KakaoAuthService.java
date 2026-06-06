package com.zaritalk.checklist.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zaritalk.checklist.domain.User;
import com.zaritalk.checklist.dto.LoginResponse;
import com.zaritalk.checklist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
@Transactional
@RequiredArgsConstructor
public class KakaoAuthService {

    private static final String KAKAO_USER_ME_URL = "https://kapi.kakao.com/v2/user/me";

    private final UserRepository userRepository;
    private final RestClient restClient = RestClient.create();

    public LoginResponse login(String accessToken) {
        KakaoUserInfo kakaoUser = fetchKakaoUserInfo(accessToken);
        User user = userRepository.findByKakaoId(kakaoUser.id())
                .orElseGet(() -> userRepository.save(User.create(kakaoUser.id(), kakaoUser.nickname())));
        return new LoginResponse(user.getPk(), user.getNickname());
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
