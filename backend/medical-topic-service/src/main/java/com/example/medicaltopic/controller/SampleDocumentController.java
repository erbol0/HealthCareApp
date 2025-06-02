package com.example.medicaltopic.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.medicaltopic.mongo.SampleDocument;
import com.example.medicaltopic.mongo.SampleDocumentService;

@RestController
@RequestMapping("/api/mongo-documents")
public class SampleDocumentController {
    @Autowired
    private SampleDocumentService service;

    @PostMapping
    public ResponseEntity<SampleDocument> create(@RequestBody SampleDocument doc) {
        return ResponseEntity.ok(service.save(doc));
    }

    @GetMapping
    public ResponseEntity<List<SampleDocument>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SampleDocument> getById(@PathVariable String id) {
        Optional<SampleDocument> doc = service.findById(id);
        return doc.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SampleDocument> update(@PathVariable String id, @RequestBody SampleDocument update) {
        Optional<SampleDocument> docOpt = service.findById(id);
        if (docOpt.isPresent()) {
            SampleDocument doc = docOpt.get();
            doc.setName(update.getName());
            doc.setDescription(update.getDescription());
            return ResponseEntity.ok(service.save(doc));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
