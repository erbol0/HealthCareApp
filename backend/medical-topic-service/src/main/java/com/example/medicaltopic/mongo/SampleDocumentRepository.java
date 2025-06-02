package com.example.medicaltopic.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SampleDocumentRepository extends MongoRepository<SampleDocument, String> {
}
