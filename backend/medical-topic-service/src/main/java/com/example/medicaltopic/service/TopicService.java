package com.example.medicaltopic.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.medicaltopic.dto.ContentItemRequestPart;
import com.example.medicaltopic.dto.ContentItemResponse;
import com.example.medicaltopic.dto.TopicCreateRequest;
import com.example.medicaltopic.dto.TopicResponse;
import com.example.medicaltopic.entity.Topic;
import com.example.medicaltopic.entity.TopicContentItem;
import com.example.medicaltopic.enums.ContentType;
import com.example.medicaltopic.exception.ResourceNotFoundException;
import com.example.medicaltopic.repository.TopicRepository;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public TopicService(TopicRepository topicRepository, CloudinaryService cloudinaryService) {
        this.topicRepository = topicRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public TopicResponse createTopic(TopicCreateRequest topicRequest, List<MultipartFile> files) {
        Topic topic = new Topic();
        topic.setTitle(topicRequest.getTitle());

        // Process content items
        // Match files with ContentItemRequestPart of type IMAGE by order
        int fileIndex = 0;
        List<TopicContentItem> contentItems = new ArrayList<>();
        for (ContentItemRequestPart itemRequest : topicRequest.getContentItems()) {
            TopicContentItem contentItem = new TopicContentItem();
            contentItem.setContentType(itemRequest.getType());
            contentItem.setDisplayOrder(itemRequest.getDisplayOrder());
            contentItem.setTopic(topic);

            if (itemRequest.getType() == ContentType.TEXT) {
                if (itemRequest.getTextValue() == null || itemRequest.getTextValue().isBlank()) {
                    throw new IllegalArgumentException("Text content cannot be empty for TEXT type at order " + itemRequest.getDisplayOrder());
                }
                contentItem.setTextValue(itemRequest.getTextValue());
            } else if (itemRequest.getType() == ContentType.IMAGE) {
                if (files == null || fileIndex >= files.size() || files.get(fileIndex) == null || files.get(fileIndex).isEmpty()) {
                    throw new IllegalArgumentException("Image file is missing for content item at display order " + itemRequest.getDisplayOrder());
                }
                MultipartFile imageFile = files.get(fileIndex++);
                Map<String, String> uploadResult = cloudinaryService.uploadImage(imageFile, "medical_topics");
                contentItem.setImageUrl(uploadResult.get("url"));
                contentItem.setCloudinaryPublicId(uploadResult.get("public_id"));
            }
            contentItems.add(contentItem);
        }
        topic.setContentItems(contentItems);
        Topic savedTopic = topicRepository.save(topic);
        return mapToTopicResponse(savedTopic);
    }

    @Transactional(readOnly = true)
    public TopicResponse getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
        // Increment views (simple version, could be more sophisticated)
        topic.setViews(topic.getViews() + 1);
        topicRepository.save(topic); // Save updated view count
        return mapToTopicResponse(topic);
    }

    @Transactional(readOnly = true)
    public Page<TopicResponse> getAllTopics(Pageable pageable) {
        return topicRepository.findAll(pageable).map(this::mapToTopicResponseSummary);
    }

    @Transactional
    public TopicResponse updateTopic(Long id, TopicCreateRequest topicRequest, List<MultipartFile> files) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));

        topic.setTitle(topicRequest.getTitle());

        // --- START OF IMPORTANT CHANGES ---
        // Get the existing managed collection
        List<TopicContentItem> existingContentItems = topic.getContentItems();

        // Delete old Cloudinary images from the items about to be removed
        existingContentItems.stream()
                .filter(item -> item.getContentType() == ContentType.IMAGE && item.getCloudinaryPublicId() != null)
                .forEach(item -> cloudinaryService.deleteImage(item.getCloudinaryPublicId()));

        // Clear the contents of the existing managed collection.
        // This will trigger orphan removal for the old items correctly.
        existingContentItems.clear();
        // Hibernate might require a flush here to process deletions before adding new items,
        // especially if there are unique constraints or other DB level checks.
        // However, often it works without explicit flush. If issues persist, consider topicRepository.flush();
        // topicRepository.flush(); // Optional, try without first.

        // Prepare new content items
        int fileIndex = 0;
        List<TopicContentItem> newContentItems = new ArrayList<>(); // Temporary list to build new items
        for (ContentItemRequestPart itemRequest : topicRequest.getContentItems()) {
            TopicContentItem contentItem = new TopicContentItem();
            contentItem.setContentType(itemRequest.getType());
            contentItem.setDisplayOrder(itemRequest.getDisplayOrder());
            contentItem.setTopic(topic); // Link back to topic

            if (itemRequest.getType() == ContentType.TEXT) {
                if (itemRequest.getTextValue() == null || itemRequest.getTextValue().isBlank()) {
                    throw new IllegalArgumentException("Text content cannot be empty for TEXT type at order " + itemRequest.getDisplayOrder());
                }
                contentItem.setTextValue(itemRequest.getTextValue());
            } else if (itemRequest.getType() == ContentType.IMAGE) {
                if (files == null || fileIndex >= files.size() || files.get(fileIndex) == null || files.get(fileIndex).isEmpty()) {
                    throw new IllegalArgumentException("Image file is missing for updated content item at display order " + itemRequest.getDisplayOrder());
                }
                MultipartFile imageFile = files.get(fileIndex++);
                Map<String, String> uploadResult = cloudinaryService.uploadImage(imageFile, "medical_topics");
                contentItem.setImageUrl(uploadResult.get("url"));
                contentItem.setCloudinaryPublicId(uploadResult.get("public_id"));
            }
            newContentItems.add(contentItem);
        }

        // Add all new items to the existing (now cleared) managed collection.
        // Do NOT do topic.setContentItems(newContentItems);
        existingContentItems.addAll(newContentItems);
        // --- END OF IMPORTANT CHANGES ---

        Topic updatedTopic = topicRepository.save(topic); // Save the parent topic
        return mapToTopicResponse(updatedTopic);
    }


    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));

        // Delete images from Cloudinary associated with this topic
        topic.getContentItems().stream()
                .filter(item -> item.getContentType() == ContentType.IMAGE && item.getCloudinaryPublicId() != null)
                .forEach(item -> cloudinaryService.deleteImage(item.getCloudinaryPublicId()));

        topicRepository.delete(topic);
    }

    @Transactional
    public TopicResponse likeTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
        topic.setLikes(topic.getLikes() + 1);
        Topic savedTopic = topicRepository.save(topic);
        return mapToTopicResponse(savedTopic);
    }

    private TopicResponse mapToTopicResponse(Topic topic) {
        List<ContentItemResponse> contentItemResponses = topic.getContentItems().stream()
                .map(item -> new ContentItemResponse(
                        item.getId(),
                        item.getContentType(),
                        item.getTextValue(),
                        item.getImageUrl(),
                        item.getDisplayOrder()))
                .collect(Collectors.toList());

        return new TopicResponse(
                topic.getId(),
                topic.getTitle(),
                topic.getViews(),
                topic.getLikes(),
                topic.getCreatedAt(),
                topic.getUpdatedAt(),
                contentItemResponses
        );
    }
    
    private TopicResponse mapToTopicResponseSummary(Topic topic) {
        // For list view, we might not want to send all content items,
        // or send a summarized version. For now, it's the same as detailed view.
        return mapToTopicResponse(topic);
    }
}