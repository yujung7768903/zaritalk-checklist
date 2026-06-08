package com.zaritalk.api.controller.response;

import com.zaritalk.api.controller.request.SituationConfigDto;
import java.util.List;

public record CompletedItemsResponse(
    List<String> completedItemIds,
    SituationConfigDto situationConfig
) {}
