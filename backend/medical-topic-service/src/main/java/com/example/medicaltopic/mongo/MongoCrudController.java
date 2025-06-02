package com.example.medicaltopic.mongo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mongo")
public class MongoCrudController {
    @Autowired
    private SymptomService symptomService;
    @Autowired
    private MessageService messageService;

    // --- Symptom endpoints ---
    @PostMapping("/symptoms")
    public ResponseEntity<Symptom> createSymptom(@RequestBody Symptom symptom) {
        return ResponseEntity.ok(symptomService.save(symptom));
    }
    @GetMapping("/symptoms")
    public ResponseEntity<List<Symptom>> getAllSymptoms() {
        return ResponseEntity.ok(symptomService.findAll());
    }
    @GetMapping("/symptoms/{id}")
    public ResponseEntity<Symptom> getSymptom(@PathVariable String id) {
        Optional<Symptom> found = symptomService.findById(id);
        return found.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/symptoms/{id}")
    public ResponseEntity<Void> deleteSymptom(@PathVariable String id) {
        symptomService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Message endpoints ---
    @PostMapping("/messages")
    public ResponseEntity<Message> createMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.save(message));
    }
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.findAll());
    }
    @GetMapping("/messages/{id}")
    public ResponseEntity<Message> getMessage(@PathVariable String id) {
        Optional<Message> found = messageService.findById(id);
        return found.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        messageService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
