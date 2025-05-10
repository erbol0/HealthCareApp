package com.example.medicaltopic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing // This can also be put on the main Application class
public class JpaAuditingConfiguration {
    // This class enables JPA auditing features like @CreatedDate, @LastModifiedDate
    // If @EnableJpaAuditing is on the main @SpringBootApplication class, this file is not strictly necessary.
}