package com.zaritalk.api.controller.response;

public record LoginResponse(Long userPk, String nickname, String token) {}
