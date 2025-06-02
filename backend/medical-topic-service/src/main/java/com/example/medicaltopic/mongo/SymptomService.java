package com.example.medicaltopic.mongo;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SymptomService {
    @Autowired
    private SymptomRepository repository;

    public Symptom save(Symptom symptom) {
        return repository.save(symptom);
    }
    public Optional<Symptom> findById(String id) {
        return repository.findById(id);
    }
    public List<Symptom> findAll() {
        return repository.findAll();
    }
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
