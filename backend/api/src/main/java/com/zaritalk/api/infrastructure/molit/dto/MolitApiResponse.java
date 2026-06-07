package com.zaritalk.api.infrastructure.molit.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zaritalk.api.infrastructure.molit.dto.deserializer.MolitItemListDeserializer;

import java.util.List;
import java.util.Optional;

public record MolitApiResponse(
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
            List<MolitTradeItem> item
    ) {}

    public List<MolitTradeItem> getItems() {
        return Optional.ofNullable(response)
                .map(Response::body)
                .map(Body::items)
                .map(Items::item)
                .orElse(List.of());
    }
}
