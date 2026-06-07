package com.zaritalk.api.infrastructure.bldg.dto.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zaritalk.api.infrastructure.bldg.dto.BldgLedgerItemDto;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * data.go.kr 건축물대장 API는 item이 1건이면 객체, 복수면 배열로 반환한다.
 * 두 경우를 모두 List로 역직렬화하기 위한 커스텀 deserializer.
 */
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
