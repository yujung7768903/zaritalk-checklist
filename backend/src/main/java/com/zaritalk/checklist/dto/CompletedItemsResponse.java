package com.zaritalk.checklist.dto;

import java.util.List;

public record CompletedItemsResponse(List<String> completedItemIds) {
}
