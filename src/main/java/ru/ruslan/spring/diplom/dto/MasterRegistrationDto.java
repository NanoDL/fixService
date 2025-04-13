package ru.ruslan.spring.diplom.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MasterRegistrationDto {
    // Данные пользователя
    @NotBlank(message = "Имя пользователя обязательно")
    @Size(min = 3, max = 50, message = "Имя пользователя должно быть от 3 до 50 символов")
    private String username;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, message = "Пароль должен содержать минимум 6 символов")
    private String password;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный email")
    private String email;

    // Данные мастера
    @NotBlank(message = "ФИО обязательно")
    private String name;

    @NotBlank(message = "Адрес обязателен")
    private String address;

    @NotBlank(message = "Номер телефона обязателен")
    @Pattern(regexp = "^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$", 
            message = "Номер телефона должен быть в формате +7 (999) 999-99-99")
    private String phoneNumber;

    @NotBlank(message = "Специализация обязательна")
    private String specialization;

    @NotNull(message = "Опыт работы обязателен")
    @Min(value = 0, message = "Опыт работы не может быть отрицательным")
    private Integer experienceYears;

    @NotNull(message = "Цена за час обязательна")
    @DecimalMin(value = "0.0", message = "Цена не может быть отрицательной")
    private BigDecimal price;

    @Size(max = 1000, message = "Описание не должно превышать 1000 символов")
    private String description;
} 