package com.zaritalk.core.port;

import java.util.List;

/**
 * 전용면적 조회 포트.
 * 건축물대장 API 우선, 결과 없을 시 국토부 실거래가 API fallback.
 */
public interface ExclusiveAreaPort {

    /**
     * 주어진 조건으로 전용면적 목록을 조회한다.
     * bcode와 jibunAddress가 모두 비어 있지 않은 경우 건축물대장 API를 먼저 시도하고,
     * 결과가 없으면 MOLIT 실거래가 API로 fallback한다.
     *
     * @param sigunguCode 시군구코드 (5자리)
     * @param dongName    법정동명
     * @param housingType 주택 유형 ("apt" 또는 "villa")
     * @param aptName     건물명 (없으면 빈 문자열)
     * @param bcode       법정동코드 10자리 (없으면 빈 문자열)
     * @param jibunAddress 지번주소 전체 문자열 (없으면 빈 문자열)
     * @return 전용면적 목록 (오름차순 정렬, 중복 제거); 없으면 빈 리스트
     */
    List<Double> fetchAreas(String sigunguCode, String dongName, String housingType,
                            String aptName, String bcode, String jibunAddress);
}
