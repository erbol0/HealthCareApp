package com.example.medicaltopic.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String title;
    private long views;
    private long likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentItemResponse> contentItems;
}