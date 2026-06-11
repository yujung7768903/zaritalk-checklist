package com.zaritalk.api.controller.response;

import com.zaritalk.api.controller.request.SituationConfigDto;
import com.zaritalk.core.service.ProgressInfo;
import java.util.List;

public record CompletedItemsResponse(
    List<String> completedItemIds,
    SituationConfigDto situationConfig
) {
    public static CompletedItemsResponse from(ProgressInfo info) {
        SituationConfigDto situationConfig = new SituationConfigDto(
            info.currentHousing(),
            info.nextHousing(),
            info.exitType()
        );
        return new CompletedItemsResponse(info.completedItemIds(), situationConfig);
    }
}
