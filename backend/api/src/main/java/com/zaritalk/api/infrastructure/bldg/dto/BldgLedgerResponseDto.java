package com.zaritalk.api.infrastructure.bldg.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.api.infrastructure.bldg.dto.deserializer.BldgLedgerItemListDeserializer;

import java.util.List;

public record BldgLedgerResponseDto(
        Response response
) {
    public record Response(
            Body body
    ) {}

    public record Body(
            Items items,
            int totalCount
    ) {}

    public record Items(
            @JsonDeserialize(using = BldgLedgerItemListDeserializer.class)
            List<BldgLedgerItemDto> item
    ) {}
}
