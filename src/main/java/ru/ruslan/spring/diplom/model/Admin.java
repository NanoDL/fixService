package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "admins")
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private MyUser myUser;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(length = 1000)
    private String notes;

    //@Column(nullable = false)
    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private boolean isSuperAdmin = false;
}
