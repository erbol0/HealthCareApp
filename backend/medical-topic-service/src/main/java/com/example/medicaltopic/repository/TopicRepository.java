package com.example.medicaltopic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.medicaltopic.entity.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
}