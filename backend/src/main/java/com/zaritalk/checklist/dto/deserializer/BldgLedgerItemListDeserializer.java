package com.zaritalk.checklist.dto.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zaritalk.checklist.dto.BldgLedgerItemDto;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class BldgLedgerItemListDeserializer extends StdDeserializer<List<BldgLedgerItemDto>> {

    public BldgLedgerItemListDeserializer() {
        super(List.class);
    }

    @Override
    public List<BldgLedgerItemDto> deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
        List<BldgLedgerItemDto> result = new ArrayList<>();
        if (p.currentToken() == JsonToken.START_ARRAY) {
            while (p.nextToken() != JsonToken.END_ARRAY) {
                result.add(ctx.readValue(p, BldgLedgerItemDto.class));
            }
        } else if (p.currentToken() == JsonToken.START_OBJECT) {
            result.add(ctx.readValue(p, BldgLedgerItemDto.class));
        }
        return result;
    }
}
