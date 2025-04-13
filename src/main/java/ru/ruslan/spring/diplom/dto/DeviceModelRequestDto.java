package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.DeviceType;

@Data
public class DeviceModelRequestDto {
    @Column(nullable = false)
    @NotBlank
    private String name;

    private String manufacturer;

    @Enumerated(EnumType.STRING)
    private DeviceType type;
}
