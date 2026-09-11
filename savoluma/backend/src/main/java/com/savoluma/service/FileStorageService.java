package com.savoluma.service;

import com.savoluma.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    @Value("${app.upload.dir:${user.home}/savoluma-uploads}")
    private String uploadDir;

    public String store(MultipartFile file, String subdirectory, long maxBytes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A file is required.");
        }
        if (file.getSize() > maxBytes) {
            throw new BadRequestException("File exceeds the maximum allowed size.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType();
        if (!ALLOWED.contains(contentType)) {
            throw new BadRequestException("Unsupported file type.");
        }
        try {
            Path dir = Paths.get(uploadDir, subdirectory);
            Files.createDirectories(dir);
            String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
            String name = UUID.randomUUID() + "-" + original;
            Path dest = dir.resolve(name);
            file.transferTo(dest.toFile());
            return subdirectory + "/" + name;
        } catch (IOException e) {
            throw new BadRequestException("Could not store the uploaded file.");
        }
    }
}
