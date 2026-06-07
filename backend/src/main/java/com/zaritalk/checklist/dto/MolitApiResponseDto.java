package com.zaritalk.checklist.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.checklist.dto.deserializer.MolitItemListDeserializer;

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
