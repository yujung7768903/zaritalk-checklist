package com.zaritalk.checklist.domain;

public enum ChecklistType {
    NEW_HOME, MOVE;

    public static ChecklistType fromSlug(String slug) {
        return switch (slug) {
            case "new-home" -> NEW_HOME;
            case "move" -> MOVE;
            default -> throw new IllegalArgumentException("지원하지 않는 체크리스트 타입입니다: " + slug);
        };
    }
}
