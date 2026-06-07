package com.zaritalk.api.infrastructure;

import com.zaritalk.api.infrastructure.molit.MolitApiClient;
import com.zaritalk.core.port.TradeDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 국토부 실거래가 API 어댑터 (전용면적 조회)
 * TradeDataPort를 구현하며 실제 HTTP 호출은 MolitApiClient에 위임한다.
 */
@Component
@RequiredArgsConstructor
public class MolitTradeAdapter implements TradeDataPort {

    private final MolitApiClient molitApiClient;

    @Override
    public List<Double> fetchAvailableAreas(String sigunguCode, String dongName,
                                            String housingType, String aptName) {
        return molitApiClient.fetchAvailableAreas(sigunguCode, dongName, housingType, aptName);
    }
}
