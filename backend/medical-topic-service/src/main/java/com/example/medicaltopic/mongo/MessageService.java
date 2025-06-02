package com.example.medicaltopic.mongo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {
    @Autowired
    private MessageRepository repository;

    public Message save(Message message) {
        return repository.save(message);
    }
    public Optional<Message> findById(String id) {
        return repository.findById(id);
    }
    public List<Message> findAll() {
        return repository.findAll();
    }
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
