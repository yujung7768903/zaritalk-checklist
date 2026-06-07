package com.zaritalk.core.port;

/**
 * @param avgPrice 평균 거래가 (원)
 * @param count    거래 건수
 */
public record MarketPriceResult(double avgPrice, int count) {}
