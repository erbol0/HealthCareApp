package com.example.medicaltopic.mongo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SampleDocumentService {

    @Autowired
    private SampleDocumentRepository repository;

    public SampleDocument save(SampleDocument doc) {
        return repository.save(doc);
    }

    public Optional<SampleDocument> findById(String id) {
        return repository.findById(id);
    }

    public List<SampleDocument> findAll() {
        return repository.findAll();
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
