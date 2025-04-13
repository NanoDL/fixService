package ru.ruslan.spring.diplom.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.UserRole;
import java.math.BigDecimal;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String bio;
    private String avatarUrl;
    private Boolean isVerified;
    private Boolean isBlocked;
    private Boolean isSuperAdmin;
    private String specialization;
    private Integer experienceYears;
    private Double rating;
    private BigDecimal price;
    private String notes;
}
