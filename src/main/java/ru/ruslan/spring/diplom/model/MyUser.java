package ru.ruslan.spring.diplom.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import ru.ruslan.spring.diplom.enums.UserRole;


import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class MyUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotEmpty
    @NotBlank
    private String username;

    @Column(nullable = false)
    @NotEmpty
    @NotBlank
    private String password;

    @Column(unique = true, nullable = false)
    @Email
    @NotEmpty
    @NotBlank
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    @JsonProperty("isActive")
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Метод для установки времени создания перед персистентностью
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Метод для обновления времени перед обновлением
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}