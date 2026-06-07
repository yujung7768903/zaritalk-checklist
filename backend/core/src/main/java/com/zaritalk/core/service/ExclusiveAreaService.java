package com.zaritalk.core.service;

import com.zaritalk.core.port.BuildingRegistryPort;
import com.zaritalk.core.port.TradeDataPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 전용면적 조회 서비스
 * 건물 등록 정보(건축물대장)를 우선 시도하고, 결과가 없으면 실거래 데이터로 fallback한다.
 * 조회 우선순위는 비즈니스 정책이므로 인프라 계층이 아닌 이 서비스가 결정한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExclusiveAreaService {

    private final BuildingRegistryPort buildingRegistryPort;
    private final TradeDataPort        tradeDataPort;

    /**
     * 전용면적 목록을 조회한다.
     * bcode와 jibunAddress가 모두 주어지면 건축물대장을 먼저 시도한다.
     * 결과가 없으면 실거래 데이터로 fallback한다.
     */
    public List<Double> fetchAreas(String sigunguCode, String dongName, String housingType,
                                   String aptName, String bcode, String jibunAddress) {
        if (!bcode.isBlank() && !jibunAddress.isBlank()) {
            List<Double> areas = buildingRegistryPort.fetchAvailableAreas(bcode, jibunAddress);
            if (!areas.isEmpty()) {
                log.info("건축물대장 조회 성공 [bcode={}]", bcode);
                return areas;
            }
            log.info("건축물대장 결과 없음 — 실거래 데이터로 fallback [bcode={}]", bcode);
        }
        return tradeDataPort.fetchAvailableAreas(sigunguCode, dongName, housingType, aptName);
    }
}
