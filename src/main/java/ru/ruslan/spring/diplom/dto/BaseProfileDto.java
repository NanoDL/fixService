package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import ru.ruslan.spring.diplom.enums.UserRole;

@Data
public class BaseProfileDto {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
} 