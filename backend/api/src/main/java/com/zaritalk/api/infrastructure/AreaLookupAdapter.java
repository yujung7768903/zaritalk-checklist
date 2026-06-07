package com.zaritalk.api.infrastructure;

import com.zaritalk.api.infrastructure.bldg.BldgLedgerClient;
import com.zaritalk.api.infrastructure.molit.MolitApiClient;
import com.zaritalk.core.port.AreaLookupPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 전용면적 조회 어댑터.
 * 건축물대장 API를 우선 시도하고 결과가 없으면 MOLIT 실거래가 API로 fallback한다.
 */
@Component
@RequiredArgsConstructor
public class AreaLookupAdapter implements AreaLookupPort {

    private final BldgLedgerClient bldgLedgerClient;
    private final MolitApiClient   molitApiClient;

    /**
     * bcode와 jibunAddress가 모두 비어 있지 않으면 건축물대장 API를 먼저 시도한다.
     * 결과가 없으면 MOLIT 실거래가 API로 fallback한다.
     */
    @Override
    public List<Double> fetchAreas(String sigunguCode, String dongName, String housingType,
                                   String aptName, String bcode, String jibunAddress) {
        if (!bcode.isBlank() && !jibunAddress.isBlank()) {
            List<Double> areas = bldgLedgerClient.fetchAreasByAddress(bcode, jibunAddress);
            if (!areas.isEmpty()) return areas;
        }
        return molitApiClient.fetchAvailableAreas(sigunguCode, dongName, housingType, aptName);
    }
}
