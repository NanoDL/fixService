package ru.ruslan.spring.diplom.dto;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.model.Order;
import ru.ruslan.spring.diplom.model.Review;

import java.time.LocalDateTime;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerResponseInfoDto {
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    @NotBlank(message = "Номер телефона обязателен")
    @Pattern(regexp = "^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$",
            message = "Номер телефона должен быть в формате +7 (999) 999-99-99")
    private String phoneNumber;

    @Column(nullable = false)
    @NotBlank
    private String address;

    @Column(length = 1000)
    private String bio;
}
