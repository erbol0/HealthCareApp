package com.example.medicaltopic.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.medicaltopic.config.ClerkConfig;

@Service
public class ClerkAuthService {

    @Autowired
    private ClerkConfig clerkConfig;

    @Autowired
    private RestTemplate restTemplate;

    public boolean verifyToken(String token) {
        String url = clerkConfig.getClerkBaseUrl() + "/sessions/" + token;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + clerkConfig.getClerkApiKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }

    // Add more Clerk-related methods as needed (e.g., getUser, createUser, etc.)
}
