package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class MasterProfileDto extends BaseProfileDto {
    private String name;
    private String address;
    private String phoneNumber;
    private String specialization;
    private Integer experienceYears;
    private Double rating;
    private BigDecimal price;
    private String description;
    private Boolean isAvailable;
} 