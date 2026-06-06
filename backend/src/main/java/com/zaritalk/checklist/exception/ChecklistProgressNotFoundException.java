package com.zaritalk.checklist.exception;

public class ChecklistProgressNotFoundException extends RuntimeException {
    public ChecklistProgressNotFoundException() {
        super("체크리스트 진행 상태를 찾을 수 없습니다.");
    }
}
