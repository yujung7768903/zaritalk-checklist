package com.zaritalk.checklist.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MolitTradeItemDto(
        @JsonProperty("umdNm")      String umdNm,
        @JsonProperty("aptNm")      String aptNm,
        @JsonProperty("excluUseAr") String excluUseAr,
        @JsonProperty("dealAmount") String dealAmount
) {}
