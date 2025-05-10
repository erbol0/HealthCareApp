package com.example.medicaltopic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // To enable @CreatedDate and @LastModifiedDate
public class MedicalTopicServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalTopicServiceApplication.class, args);
    }
}