package com.zaritalk.core.port;

import java.util.List;

/**
 * 건물 등록 정보 조회 포트.
 * 건물에 공식 등록된 전용면적 목록을 반환한다.
 */
public interface BuildingRegistryPort {

    /**
     * 법정동코드와 지번주소로 전용면적 목록을 조회한다.
     *
     * @param bcode        법정동코드 10자리
     * @param jibunAddress 지번주소 전체 문자열
     * @return 전용면적 목록 (오름차순 정렬, 중복 제거); 없으면 빈 리스트
     */
    List<Double> fetchAvailableAreas(String bcode, String jibunAddress);
}
