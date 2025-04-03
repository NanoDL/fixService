package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private Integer experienceYears;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private BigDecimal pricePerHour;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean isAvailable = true;

    @Column(nullable = false)
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
