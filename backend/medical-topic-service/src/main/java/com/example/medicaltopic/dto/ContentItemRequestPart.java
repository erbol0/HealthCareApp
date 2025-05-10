package com.example.medicaltopic.dto;

import com.example.medicaltopic.enums.ContentType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContentItemRequestPart {
    @NotNull(message = "Content type cannot be null")
    private ContentType type;

    private String textValue; // Used if type is TEXT

    // For IMAGE type, the actual file will be in MultipartFile list.
    // This field could be used to map filename or an index if needed, but often order is sufficient.

    @NotNull(message = "Display order cannot be null")
    @Min(value = 0, message = "Display order must be non-negative")
    private Integer displayOrder;

    // This field can be used to match the file from the MultipartFile[] list
    // e.g., if it's an image, this might be the original filename or an index.
    // It's optional if you rely purely on the order of files and content item definitions.
    private String fileIdentifier;
}