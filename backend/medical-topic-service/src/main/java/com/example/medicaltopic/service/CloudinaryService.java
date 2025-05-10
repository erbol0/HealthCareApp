package com.example.medicaltopic.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.medicaltopic.exception.FileUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class CloudinaryService {

    private static final Logger LOGGER = Logger.getLogger(CloudinaryService.class.getName());
    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, String> uploadImage(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File to upload cannot be null or empty");
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderName, // Optional: organize images in Cloudinary folders
                "resource_type", "auto"
            ));
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            if (url == null || publicId == null) {
                LOGGER.log(Level.SEVERE, "Cloudinary upload failed, result does not contain URL or public_id: " + uploadResult.toString());
                throw new FileUploadException("Failed to upload image. Cloudinary response invalid.");
            }

            return Map.of("url", url, "public_id", publicId);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "IOException during file upload to Cloudinary", e);
            throw new FileUploadException("Failed to upload image due to IO error: " + e.getMessage(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error during file upload to Cloudinary", e);
            throw new FileUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    public void deleteImage(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            LOGGER.warning("Attempted to delete image with null or empty publicId.");
            return; // Or throw IllegalArgumentException
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            LOGGER.info("Successfully deleted image with public_id: " + publicId + " from Cloudinary.");
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "IOException during image deletion from Cloudinary for public_id: " + publicId, e);
            // Depending on policy, you might re-throw or just log
            // throw new FileUploadException("Failed to delete image from Cloudinary due to IO error: " + e.getMessage(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error during image deletion from Cloudinary for public_id: " + publicId, e);
            // throw new FileUploadException("Failed to delete image from Cloudinary: " + e.getMessage(), e);
        }
    }
}