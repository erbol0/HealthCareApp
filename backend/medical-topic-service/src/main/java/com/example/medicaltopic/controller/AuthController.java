package com.example.medicaltopic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.medicaltopic.service.ClerkAuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private ClerkAuthService clerkAuthService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        boolean valid = clerkAuthService.verifyToken(token.replace("Bearer ", ""));
        if (valid) {
            return ResponseEntity.ok().body("Token is valid");
        } else {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }
}
