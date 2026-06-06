package com.zaritalk.checklist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "checklist_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk;

    @Column(name = "kakao_id", nullable = false, unique = true)
    private Long kakaoId;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static User create(Long kakaoId, String nickname) {
        User user = new User();
        user.kakaoId = kakaoId;
        user.nickname = nickname;
        user.createdAt = LocalDateTime.now();
        return user;
    }

    public Long getPk() { return pk; }
    public String getNickname() { return nickname; }
}
