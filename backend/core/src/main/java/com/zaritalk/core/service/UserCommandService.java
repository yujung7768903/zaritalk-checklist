package com.zaritalk.core.service;

import com.zaritalk.core.domain.User;
import com.zaritalk.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 회원 생성/수정 서비스.
 * 카카오 로그인 시 신규 회원을 생성하거나 기존 회원을 조회한다.
 */
@Service
@RequiredArgsConstructor
public class UserCommandService {

    private final UserRepository userRepository;

    /**
     * 카카오 ID로 회원을 조회하고, 없으면 신규 가입 처리한다.
     *
     * @param kakaoId  카카오 사용자 ID
     * @param nickname 카카오 프로필 닉네임
     * @return 기존 또는 신규 생성된 회원 엔티티
     */
    @Transactional
    public User findOrCreate(Long kakaoId, String nickname) {
        return userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> userRepository.save(User.create(kakaoId, nickname)));
    }
}
