package com.nivva.api.goal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.nivva.api.common.error.InvalidGoalException;

public enum GoalIconKey {
    HOME("home"),
    TRAVEL("travel"),
    EMERGENCY("emergency"),
    EDUCATION("education"),
    PURCHASE("purchase"),
    OTHER("other");

    private final String wireValue;

    GoalIconKey(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static GoalIconKey fromWire(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        for (GoalIconKey key : values()) {
            if (key.wireValue.equals(value)) {
                return key;
            }
        }
        throw new InvalidGoalException("iconKey is not a known goal icon");
    }
}
