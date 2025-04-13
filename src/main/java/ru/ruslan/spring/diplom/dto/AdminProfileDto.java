package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminProfileDto extends BaseProfileDto {
    private String firstName;
    private String lastName;
    private String notes;
    private Boolean isSuperAdmin;
}