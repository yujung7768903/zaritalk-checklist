package com.zaritalk.checklist.dto;

public record LoginResponse(Long userPk, String nickname, String token) {
}
