package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "masters")
public class Master {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private MyUser myUser;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(nullable = false)
    @NotBlank
    private String address;

    @Column(nullable = false)
    @NotBlank(message = "Номер телефона обязателен")
    @Pattern(regexp = "^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$",
            message = "Номер телефона должен быть в формате +7 (999) 999-99-99")
    private String phoneNumber;

    @Column(nullable = false)
    @NotBlank
    private String specialization;

    @Column(nullable = false)
    @NotNull(message = "Опыт работы обязателен")
    @Min(value = 0, message = "Опыт работы не может быть отрицательным")
    private Integer experienceYears;

    @Column(nullable = false)
    @NotNull
    private Double rating = 0.0;

    @Column(nullable = false)
    @NotNull
    private BigDecimal price;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean isAvailable = true;

    //@Column(nullable = false)
    private LocalDateTime lastLoginAt;

    @OneToMany(mappedBy = "master")
    private List<Order> orders;

    @OneToMany(mappedBy = "master")
    private List<Review> reviews;

    public void updateRating(Double newRating) {
        if (newRating != null && newRating >= 0 && newRating <= 5) {
            this.rating = newRating;
        }
    }
}
