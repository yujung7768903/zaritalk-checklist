package com.zaritalk.api.infrastructure.molit.dto;

public record MolitTradeItem(
        String umdNm,
        String aptNm,
        String mhouseNm,
        String excluUseAr,
        String dealAmount
) {}
