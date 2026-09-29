package com.nivva.api.category;

public record CategoryResponse(String id, String name, CategoryKind kind) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getKind());
    }
}
