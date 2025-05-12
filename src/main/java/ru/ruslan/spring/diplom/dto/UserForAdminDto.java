package ru.ruslan.spring.diplom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.UserRole;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserForAdminDto {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
    @JsonProperty("isActive")
    private boolean isActive;
}
