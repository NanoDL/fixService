package ru.ruslan.spring.diplom.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final String uploadDir = "/uploads/firmwares";

    public String save(MultipartFile file) throws IOException {
        // Например, мы хотим сохранять в "uploads/firmwares" в корне проекта
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "firmwares");
        Files.createDirectories(uploadDir); // на всякий случай

        String newFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destination = uploadDir.resolve(newFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

// Вернём относительный URL для хранения в БД
        String fileUrl = "/uploads/firmwares/" + newFilename;
        return fileUrl;
    }
}
