package com.example.medicaltopic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

public class ClerkConfig {

    @Value("${clerk.api.key}")
    private String clerkApiKey;

    @Value("${clerk.api.base-url}")
    private String clerkBaseUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getClerkApiKey() {
        return clerkApiKey;
    }

    public String getClerkBaseUrl() {
        return clerkBaseUrl;
    }
}
