package com.nivva.api.common.error;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(String categoryId) {
        super("Category '" + categoryId + "' was not found");
    }
}
