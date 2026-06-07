package com.zaritalk.api.infrastructure.bldg.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.api.infrastructure.bldg.dto.deserializer.BldgLedgerItemListDeserializer;

import java.util.List;
import java.util.Optional;

public record BldgLedgerResponseDto(
        Response response
) {
    public record Response(
            Body body
    ) {}

    public record Body(
            Items items,
            Integer totalCount
    ) {}

    public record Items(
            @JsonDeserialize(using = BldgLedgerItemListDeserializer.class)
            List<BldgLedgerItemDto> item
    ) {}

    public List<BldgLedgerItemDto> getItems() {
        return Optional.ofNullable(response)
                .map(Response::body)
                .map(Body::items)
                .map(Items::item)
                .orElse(List.of());
    }
}
