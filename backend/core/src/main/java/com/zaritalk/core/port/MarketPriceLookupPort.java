package com.zaritalk.core.port;

import java.util.Optional;

/**
 * 시세(실거래가 평균) 조회 포트.
 * 국토부 실거래가 API를 통해 최근 3개월 평균 거래가를 반환한다.
 */
public interface MarketPriceLookupPort {

    /**
     * 최근 3개월 실거래가 평균을 조회한다.
     * 건물명 매칭 우선, 없으면 동 단위 fallback.
     *
     * @param sigunguCode 시군구코드 (5자리)
     * @param dongName    법정동명
     * @param housingType 주택 유형 ("apt" 또는 "villa")
     * @param area        전용면적 (±5㎡ 허용)
     * @param aptName     건물명 (없으면 빈 문자열)
     * @return 평균가와 거래 건수; 거래 데이터 없으면 Optional.empty()
     */
    Optional<MarketPriceResult> fetchRecentAvg(String sigunguCode, String dongName,
                                               String housingType, double area, String aptName);

    /**
     * 실거래가 조회 결과.
     *
     * @param avgPrice 평균 거래가 (원)
     * @param count    거래 건수
     */
    record MarketPriceResult(double avgPrice, int count) {}
}
