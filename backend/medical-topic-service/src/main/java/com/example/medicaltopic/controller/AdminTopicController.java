package com.example.medicaltopic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.medicaltopic.dto.IdResponse;
import com.example.medicaltopic.dto.TopicCreateRequest;
import com.example.medicaltopic.dto.TopicResponse;
import com.example.medicaltopic.service.TopicService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/topics")
@Tag(name = "Admin Topic Management", description = "APIs for administrators to manage medical topics")
public class AdminTopicController {

    private final TopicService topicService;

    @Autowired
    public AdminTopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @Operation(summary = "Create a new medical topic",
            description = "Creates a new topic with text and image content items. " +
                          "The 'topicData' part should be a JSON string matching TopicCreateRequest schema. " +
                          "Image files should be provided in the 'files' part, ordered corresponding to IMAGE type content items.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = TopicCreateRequest.class))),
            responses = {
                @ApiResponse(responseCode = "201", description = "Topic created successfully",
                             content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = TopicResponse.class))),
                @ApiResponse(responseCode = "400", description = "Invalid input data")
            })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TopicResponse> createTopic(
            @Parameter(description = "JSON data for the topic (title and content structure). For content items of type IMAGE, the actual file comes from the 'files' part.",
                       required = true, schema = @Schema(type = "string", format="binary")) // Swagger UI trick for JSON part
            @RequestPart("topicData") @Valid TopicCreateRequest topicRequest,
            @Parameter(description = "List of image files for content items of type IMAGE. Order should match image type items in topicData.",
                       required = false) // Required based on contentItems
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        TopicResponse createdTopic = topicService.createTopic(topicRequest, files);
        return new ResponseEntity<>(createdTopic, HttpStatus.CREATED);
    }

    @Operation(summary = "Get a topic by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Topic found"),
            @ApiResponse(responseCode = "404", description = "Topic not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable Long id) {
        TopicResponse topic = topicService.getTopicById(id);
        return ResponseEntity.ok(topic);
    }

    @Operation(summary = "Get all topics (paginated)", responses = {
            @ApiResponse(responseCode = "200", description = "List of topics retrieved")
    })
    @GetMapping
    public ResponseEntity<Page<TopicResponse>> getAllTopics(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
 Pageable pageable) {
        Page<TopicResponse> topics = topicService.getAllTopics(pageable);
        return ResponseEntity.ok(topics);
    }

    @Operation(summary = "Update an existing medical topic",
            description = "Updates an existing topic. Behaves similarly to create: old content is replaced. Provide topicData and files.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = TopicCreateRequest.class))), // Can use same DTO for simplicity
            responses = {
                @ApiResponse(responseCode = "200", description = "Topic updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid input data"),
                @ApiResponse(responseCode = "404", description = "Topic not found")
            })
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TopicResponse> updateTopic(
            @PathVariable Long id,
            @Parameter(description = "JSON data for the topic update.", required = true, schema = @Schema(type = "string", format="binary"))
            @RequestPart("topicData") @Valid TopicCreateRequest topicRequest,
            @Parameter(description = "List of new image files for content items of type IMAGE.", required = false)
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        TopicResponse updatedTopic = topicService.updateTopic(id, topicRequest, files);
        return ResponseEntity.ok(updatedTopic);
    }

    @Operation(summary = "Delete a topic by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Topic deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Topic not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<IdResponse> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(new IdResponse(id, "Topic deleted successfully"));
    }

    @Operation(summary = "Like a topic", responses = {
            @ApiResponse(responseCode = "200", description = "Topic liked successfully"),
            @ApiResponse(responseCode = "404", description = "Topic not found")
    })
    @PostMapping("/{id}/like")
    public ResponseEntity<TopicResponse> likeTopic(@PathVariable Long id) {
        TopicResponse topic = topicService.likeTopic(id);
        return ResponseEntity.ok(topic);
    }
}