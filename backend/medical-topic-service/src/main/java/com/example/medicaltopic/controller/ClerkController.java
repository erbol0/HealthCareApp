package com.example.medicaltopic.controller;

import com.example.medicaltopic.service.ClerkAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clerk")
public class ClerkController {
    @Autowired
    private ClerkAuthService clerkAuthService;

    @GetMapping("/users/{id}")
    public ResponseEntity<String> getUser(@PathVariable String id) {
        String user = clerkAuthService.getUser(id);
        if (user != null) return ResponseEntity.ok(user);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/users")
    public ResponseEntity<String> createUser(@RequestParam String email, @RequestParam String password) {
        String user = clerkAuthService.createUser(email, password);
        if (user != null) return ResponseEntity.ok(user);
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        boolean deleted = clerkAuthService.deleteUser(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/users")
    public ResponseEntity<String> listUsers() {
        String users = clerkAuthService.listUsers();
        if (users != null) return ResponseEntity.ok(users);
        return ResponseEntity.badRequest().build();
    }
}
