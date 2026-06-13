package com.zaritalk.core.service;

import java.util.List;
import java.util.Map;

/**
 * 체크리스트 진행 상태 정보. (완료 항목 + 메모 + 상황 정보)
 */
public record ProgressInfo(
    List<String> completedItemIds,
    Map<String, String> itemMemos,
    String currentHousing,
    String nextHousing,
    String exitType
) {}
