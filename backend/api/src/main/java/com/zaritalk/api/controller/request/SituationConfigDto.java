package com.zaritalk.api.controller.request;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 현재 상황 정보 DTO.
 */
public record SituationConfigDto(
    @JsonProperty("currentHousing") String currentHousing,
    @JsonProperty("nextHousing") String nextHousing,
    @JsonProperty("exitType") String exitType
) {}