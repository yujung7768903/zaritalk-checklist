package com.zaritalk.api.infrastructure.molit.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.api.infrastructure.molit.dto.deserializer.MolitItemListDeserializer;

import java.util.List;

public record MolitApiResponseDto(
        Response response
) {
    public record Response(
            Body body
    ) {}

    public record Body(
            Items items
    ) {}

    public record Items(
            @JsonDeserialize(using = MolitItemListDeserializer.class)
            List<MolitTradeItemDto> item
    ) {}
}
