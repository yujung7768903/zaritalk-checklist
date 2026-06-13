package com.zaritalk.api.controller.request;

import java.util.List;
import java.util.Map;

/**
 * 체크리스트 진행 상태 저장 요청.
 */
public record SaveProgressRequest(
    List<String> completedItemIds,
    Map<String, String> itemMemos,
    SituationConfigDto situationConfig
) {}