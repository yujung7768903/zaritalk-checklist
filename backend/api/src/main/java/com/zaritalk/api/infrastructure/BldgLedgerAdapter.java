package com.zaritalk.api.infrastructure;

import com.zaritalk.api.infrastructure.bldg.BldgLedgerClient;
import com.zaritalk.core.port.BuildingRegistryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 국토부 건축물대장 API 어댑터
 * BuildingRegistryPort를 구현하며 실제 HTTP 호출은 BldgLedgerClient에 위임한다.
 */
@Component
@RequiredArgsConstructor
public class BldgLedgerAdapter implements BuildingRegistryPort {

    private final BldgLedgerClient bldgLedgerClient;

    @Override
    public List<Double> fetchAvailableAreas(String bcode, String jibunAddress) {
        return bldgLedgerClient.fetchAreasByAddress(bcode, jibunAddress);
    }
}
