package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.DeviceType;

@Data
public class FirmwareDownloadDto {
    @NotBlank
    private String name;

    private String version;

    private String fileUrl;
}
