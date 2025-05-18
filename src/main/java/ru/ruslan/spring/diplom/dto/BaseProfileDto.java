package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import ru.ruslan.spring.diplom.enums.UserRole;

import java.time.LocalDateTime;

@Data
public class BaseProfileDto {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime registrationDate;
    private LocalDateTime updatedAt;
    private boolean isActive;
} 