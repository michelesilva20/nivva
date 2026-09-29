package com.nivva.api.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(length = 32)
    private String id;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryKind kind;

    protected Category() {
    }

    public Category(String id, String name, CategoryKind kind) {
        this.id = id;
        this.name = name;
        this.kind = kind;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public CategoryKind getKind() {
        return kind;
    }
}
