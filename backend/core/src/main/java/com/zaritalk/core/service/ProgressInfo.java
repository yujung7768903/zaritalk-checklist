package com.zaritalk.core.service;

import java.util.List;

/**
 * 체크리스트 진행 상태 정보. (완료 항목 + 상황 정보)
 */
public record ProgressInfo(List<String> completedItemIds, String currentHousing, String nextHousing, String exitType) {}
