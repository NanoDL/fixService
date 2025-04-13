package ru.ruslan.spring.diplom.dto;

import lombok.Data;

@Data
public class UserOrdersRequestDto {
    private Long id;
    private String userType; // "CUSTOMER" или "MASTER"
} 