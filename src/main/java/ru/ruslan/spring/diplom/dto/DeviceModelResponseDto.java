package ru.ruslan.spring.diplom.dto;


import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.ruslan.spring.diplom.model.Firmware;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceModelResponseDto {
    private Long id;

    private String name;

    private String manufacturer;

    private String type;

    private List<FirmwareResponseInfoDto> compatibleFirmwares;
}
