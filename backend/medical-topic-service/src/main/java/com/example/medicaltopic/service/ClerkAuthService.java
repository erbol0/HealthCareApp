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
        } catch (org.springframework.web.client.RestClientException e) {
            // log error if needed
        } catch (IllegalArgumentException e) {
            // log error if needed
        }
        return false;
    }

    public String getUser(String userId) {
        String url = clerkConfig.getClerkBaseUrl() + "/users/" + userId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + clerkConfig.getClerkApiKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (org.springframework.web.client.RestClientException e) {
            // log error if needed
        } catch (IllegalArgumentException e) {
            // log error if needed
        }
        return null;
    }

    public String createUser(String email, String password) {
        String url = clerkConfig.getClerkBaseUrl() + "/users";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + clerkConfig.getClerkApiKey());
        headers.set("Content-Type", "application/json");
        String body = String.format("{\"email_address\":\"%s\",\"password\":\"%s\"}", email, password);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (org.springframework.web.client.RestClientException e) {
            // log error if needed
        } catch (IllegalArgumentException e) {
            // log error if needed
        }
        return null;
    }

    public boolean deleteUser(String userId) {
        String url = clerkConfig.getClerkBaseUrl() + "/users/" + userId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + clerkConfig.getClerkApiKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            return response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.NO_CONTENT;
        } catch (org.springframework.web.client.RestClientException e) {
            // log error if needed
        } catch (IllegalArgumentException e) {
            // log error if needed
        }
        return false;
    }

    public String listUsers() {
        String url = clerkConfig.getClerkBaseUrl() + "/users";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + clerkConfig.getClerkApiKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (org.springframework.web.client.RestClientException e) {
            // log error if needed
        } catch (IllegalArgumentException e) {
            // log error if needed
        }
        return null;
    }
}
