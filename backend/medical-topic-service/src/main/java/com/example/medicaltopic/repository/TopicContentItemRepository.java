package com.example.medicaltopic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.medicaltopic.entity.TopicContentItem;

@Repository
public interface TopicContentItemRepository extends JpaRepository<TopicContentItem, Long> {
    List<TopicContentItem> findByTopicIdOrderByDisplayOrderAsc(Long topicId);
}