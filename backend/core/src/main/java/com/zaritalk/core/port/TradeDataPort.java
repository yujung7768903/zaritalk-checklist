package com.zaritalk.core.port;

import java.util.List;

/**
 * 거래 데이터 조회 포트.
 * 실거래 이력을 기반으로 전용면적 목록을 반환한다.
 */
public interface TradeDataPort {

    /**
     * 실거래 데이터에서 전용면적 목록을 조회한다.
     *
     * @param sigunguCode 시군구코드 (5자리)
     * @param dongName    법정동명
     * @param housingType 주택 유형 ("apt" 또는 "villa")
     * @param aptName     건물명 (없으면 빈 문자열)
     * @return 전용면적 목록 (오름차순 정렬, 중복 제거); 없으면 빈 리스트
     */
    List<Double> fetchAvailableAreas(String sigunguCode, String dongName,
                                     String housingType, String aptName);
}
