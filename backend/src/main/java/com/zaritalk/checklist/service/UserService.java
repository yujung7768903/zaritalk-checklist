package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.User;
import com.zaritalk.checklist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreate(Long kakaoId, String nickname) {
        return userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> userRepository.save(User.create(kakaoId, nickname)));
    }
}
