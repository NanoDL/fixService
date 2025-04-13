package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CustomerProfileDto extends BaseProfileDto {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String bio;
    private String avatarUrl;
    private Boolean isVerified;
    private Boolean isBlocked;
} 