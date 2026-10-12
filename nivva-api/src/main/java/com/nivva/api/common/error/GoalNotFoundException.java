package com.nivva.api.common.error;

public class GoalNotFoundException extends RuntimeException {

    public GoalNotFoundException() {
        super("Goal not found");
    }
}
