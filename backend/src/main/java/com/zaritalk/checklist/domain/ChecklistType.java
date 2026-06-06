package com.zaritalk.checklist.domain;

public enum ChecklistType {
    NEW_HOME, JEONSE_MOVE, MONTHLY_MOVE;

    public static ChecklistType fromSlug(String slug) {
        return switch (slug) {
            case "new-home" -> NEW_HOME;
            case "jeonse-move" -> JEONSE_MOVE;
            case "monthly-move" -> MONTHLY_MOVE;
            default -> throw new IllegalArgumentException("지원하지 않는 체크리스트 타입입니다: " + slug);
        };
    }
}
