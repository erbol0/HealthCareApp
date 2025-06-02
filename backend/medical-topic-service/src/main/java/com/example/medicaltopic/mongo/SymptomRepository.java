package com.example.medicaltopic.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SymptomRepository extends MongoRepository<Symptom, String> {
}
