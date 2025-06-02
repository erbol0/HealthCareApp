package com.example.medicaltopic.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sample_documents")
public class SampleDocument {
    @Id
    private String id;
    private String name;
    private String description;

    // Constructors
    public SampleDocument() {}
    public SampleDocument(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
