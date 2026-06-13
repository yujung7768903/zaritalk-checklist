package com.zaritalk.api.controller.response;

import com.zaritalk.api.controller.request.SituationConfigDto;
import com.zaritalk.core.service.ProgressInfo;
import java.util.List;
import java.util.Map;

public record CompletedItemsResponse(
    List<String> completedItemIds,
    Map<String, String> itemMemos,
    SituationConfigDto situationConfig
) {
    public static CompletedItemsResponse from(ProgressInfo info) {
        SituationConfigDto situationConfig = new SituationConfigDto(
            info.currentHousing(),
            info.nextHousing(),
            info.exitType()
        );
        return new CompletedItemsResponse(info.completedItemIds(), info.itemMemos(), situationConfig);
    }
}
