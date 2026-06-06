package com.zaritalk.checklist.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.checklist.dto.deserializer.MolitItemListDeserializer;

import java.util.List;

public record MolitApiResponseDto(
        @JsonProperty("response") Response response
) {
    public record Response(
            @JsonProperty("body") Body body
    ) {}

    public record Body(
            @JsonProperty("items") Items items
    ) {}

    public record Items(
            @JsonDeserialize(using = MolitItemListDeserializer.class)
            @JsonProperty("item") List<MolitTradeItemDto> item
    ) {}
}
