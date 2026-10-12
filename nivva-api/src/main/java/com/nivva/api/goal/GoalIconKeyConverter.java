package com.nivva.api.goal;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class GoalIconKeyConverter implements AttributeConverter<GoalIconKey, String> {

    @Override
    public String convertToDatabaseColumn(GoalIconKey attribute) {
        return attribute == null ? GoalIconKey.OTHER.wireValue() : attribute.wireValue();
    }

    @Override
    public GoalIconKey convertToEntityAttribute(String dbData) {
        return GoalIconKey.fromWire(dbData);
    }
}
