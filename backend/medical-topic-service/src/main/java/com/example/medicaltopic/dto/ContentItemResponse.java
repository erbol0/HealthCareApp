package com.example.medicaltopic.dto;

import com.example.medicaltopic.enums.ContentType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentItemResponse {
    private Long id;
    private ContentType type;
    private String textValue;
    private String imageUrl;
    private Integer displayOrder;
}