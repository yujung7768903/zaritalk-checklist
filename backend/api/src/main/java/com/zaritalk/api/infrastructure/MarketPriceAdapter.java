package com.zaritalk.api.infrastructure;

import com.zaritalk.api.infrastructure.molit.MolitApiClient;
import com.zaritalk.core.port.MarketPricePort;
import com.zaritalk.core.port.MarketPriceResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 시세 조회 어댑터
 * MOLIT 실거래가 API를 통해 최근 3개월 평균 거래가를 반환한다.
 */
@Component
@RequiredArgsConstructor
public class MarketPriceAdapter implements MarketPricePort {

    private final MolitApiClient molitApiClient;

    /**
     * MOLIT 실거래가 API로 최근 평균가를 조회한다.
     */
    @Override
    public Optional<MarketPriceResult> fetchRecentAvg(String sigunguCode, String dongName,
                                                      String housingType, double area, String aptName) {
        return molitApiClient.fetchRecentAvg(sigunguCode, dongName, housingType, area, aptName);
    }
}
