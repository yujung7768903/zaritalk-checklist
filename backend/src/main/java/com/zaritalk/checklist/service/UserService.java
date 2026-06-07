package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.User;
import com.zaritalk.checklist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 회원 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 카카오 ID로 회원 조회, 없으면 신규 가입
     */
    @Transactional
    public User findOrCreate(Long kakaoId, String nickname) {
        return userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> userRepository.save(User.create(kakaoId, nickname)));
    }
}
