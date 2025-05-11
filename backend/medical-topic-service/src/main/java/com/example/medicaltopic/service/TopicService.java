package com.example.medicaltopic.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

        // Validate that we have files for all IMAGE type content items
        long imageItemCount = topicRequest.getContentItems().stream()
                .filter(item -> item.getType() == ContentType.IMAGE)
                .count();
        if (imageItemCount > 0) {
            if (files == null || files.size() != imageItemCount) {
                throw new IllegalArgumentException(
                    String.format("Expected %d image files but received %d", 
                        imageItemCount, 
                        files == null ? 0 : files.size())
                );
            }
            // Validate that all files are not empty
            for (int i = 0; i < files.size(); i++) {
                if (files.get(i) == null || files.get(i).isEmpty()) {
                    throw new IllegalArgumentException(
                        String.format("Image file at index %d is null or empty", i)
                    );
                }
            }
        }

        // Process content items
        int fileIndex = 0;
        List<TopicContentItem> contentItems = new ArrayList<>();
        
        for (ContentItemRequestPart itemRequest : topicRequest.getContentItems()) {
            TopicContentItem contentItem = new TopicContentItem();
            contentItem.setContentType(itemRequest.getType());
            contentItem.setDisplayOrder(itemRequest.getDisplayOrder());
            contentItem.setTopic(topic);

            if (itemRequest.getType() == ContentType.TEXT) {
                if (itemRequest.getTextValue() == null || itemRequest.getTextValue().isBlank()) {
                    throw new IllegalArgumentException(
                        String.format("Text content cannot be empty for TEXT type at order %d", 
                            itemRequest.getDisplayOrder())
                    );
                }
                contentItem.setTextValue(itemRequest.getTextValue());
            } else if (itemRequest.getType() == ContentType.IMAGE) {
                MultipartFile imageFile = files.get(fileIndex++);
                try {
                    Map<String, String> uploadResult = cloudinaryService.uploadImage(imageFile, "medical_topics");
                    contentItem.setImageUrl(uploadResult.get("url"));
                    contentItem.setCloudinaryPublicId(uploadResult.get("public_id"));
                } catch (Exception e) {
                    throw new IllegalArgumentException(
                        String.format("Failed to upload image for content item at order %d: %s", 
                            itemRequest.getDisplayOrder(), 
                            e.getMessage())
                    );
                }
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
    public TopicResponse updateTopic(Long id, TopicCreateRequest topicUpdateRequest, List<MultipartFile> newFiles) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));

        topic.setTitle(topicUpdateRequest.getTitle());

        // Store old image public IDs to delete them from Cloudinary AFTER transaction if they are no longer used
        List<String> cloudinaryIdsToDelete = new ArrayList<>();

        // Get a mutable copy of the existing items to manage merging/removal
        List<TopicContentItem> existingContentItems = new ArrayList<>(topic.getContentItems());
        topic.getContentItems().clear(); // Clear the original collection to break old links for orphan removal logic
                                        // and to correctly re-add items in the new order.
        topicRepository.flush(); // Ensure the clear operation is processed and orphans are handled before re-adding.
                                 // This also helps avoid issues if new items have same displayOrder as old ones momentarily.


        int newFileIndex = 0;
        // Map new content items by display order for easier lookup if needed, though direct iteration is fine
        // List<ContentItemRequestPart> newRequestedItems = topicUpdateRequest.getContentItems();

        List<TopicContentItem> finalContentItems = new ArrayList<>();

        for (ContentItemRequestPart requestedItemPart : topicUpdateRequest.getContentItems()) {
            TopicContentItem itemToSave = new TopicContentItem();
            itemToSave.setContentType(requestedItemPart.getType());
            itemToSave.setDisplayOrder(requestedItemPart.getDisplayOrder());
            itemToSave.setTopic(topic);

            if (requestedItemPart.getType() == ContentType.TEXT) {
                if (requestedItemPart.getTextValue() == null || requestedItemPart.getTextValue().isBlank()) {
                    throw new IllegalArgumentException("Text content cannot be empty for TEXT type at order " + requestedItemPart.getDisplayOrder());
                }
                itemToSave.setTextValue(requestedItemPart.getTextValue());
            } else if (requestedItemPart.getType() == ContentType.IMAGE) {
                // If an image is requested for this slot, a new file MUST be provided.
                // To keep an old image, the client should not send an IMAGE part for that slot,
                // or a more complex DTO is needed for updates (e.g. with existing image URLs/IDs).
                // This simplified version assumes any IMAGE item in the update request implies a NEW image.

                // Find if there was an old image at this display order to delete its Cloudinary asset
                Optional<TopicContentItem> oldItemAtThisOrder = existingContentItems.stream()
                    .filter(ci -> ci.getDisplayOrder().equals(requestedItemPart.getDisplayOrder()) && ci.getContentType() == ContentType.IMAGE)
                    .findFirst();

                if (oldItemAtThisOrder.isPresent() && oldItemAtThisOrder.get().getCloudinaryPublicId() != null) {
                    cloudinaryIdsToDelete.add(oldItemAtThisOrder.get().getCloudinaryPublicId());
                }


                if (newFiles == null || newFileIndex >= newFiles.size() || newFiles.get(newFileIndex) == null || newFiles.get(newFileIndex).isEmpty()) {
                    // If strict replacement: throw new IllegalArgumentException("An image file must be provided for IMAGE content item at display order " + requestedItemPart.getDisplayOrder() + " during update.");
                    // If trying to keep old image IF NO NEW FILE, this is where it gets complex without IDs.
                    // For now, let's assume if IMAGE is specified, a NEW file is intended or it's an error.
                    // This means to "keep" an image, the client would have to reconstruct the request with the old image URL if not sending a file.
                    // OR, a better approach: if no new file, and an old image existed at this order, reuse it.
                    // This is difficult because `existingContentItems` is now cleared.
                    // We need to reconcile before clearing.
                    // For now, simplified: Update always means new file for IMAGE type.

                    // Let's adjust: if an image is *described* in the update, it must have a corresponding file.
                     throw new IllegalArgumentException("A new image file must be provided for any IMAGE content item defined in the update request. Slot order: " + requestedItemPart.getDisplayOrder());
                }

                MultipartFile imageFile = newFiles.get(newFileIndex++);
                Map<String, String> uploadResult = cloudinaryService.uploadImage(imageFile, "medical_topics");
                itemToSave.setImageUrl(uploadResult.get("url"));
                itemToSave.setCloudinaryPublicId(uploadResult.get("public_id"));
            }
            finalContentItems.add(itemToSave);
        }

        // Add items that were in existingContentItems but NOT in the new request (based on displayOrder and type perhaps)
        // to the cloudinaryIdsToDelete list. This handles items completely removed.
        for(TopicContentItem oldItem : existingContentItems) {
            boolean isInNewRequest = topicUpdateRequest.getContentItems().stream()
                .anyMatch(newItem -> newItem.getDisplayOrder().equals(oldItem.getDisplayOrder()) && newItem.getType() == oldItem.getContentType());
            if (!isInNewRequest && oldItem.getContentType() == ContentType.IMAGE && oldItem.getCloudinaryPublicId() != null) {
                if (!cloudinaryIdsToDelete.contains(oldItem.getCloudinaryPublicId())) { // Avoid duplicates
                    cloudinaryIdsToDelete.add(oldItem.getCloudinaryPublicId());
                }
            }
        }


        // topic.getContentItems().clear(); // ALREADY DONE ABOVE WITH FLUSH
        topic.getContentItems().addAll(finalContentItems);

        Topic updatedTopic = topicRepository.save(topic); // Persist changes

        // Perform Cloudinary deletions after transaction commits successfully
        // This requires this method not to be @Transactional or to use TransactionSynchronizationManager
        // For simplicity here, we'll call delete. In a real app, consider an event-driven approach for robustness.
        cloudinaryIdsToDelete.forEach(cloudinaryService::deleteImage);

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