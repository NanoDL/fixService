package ru.ruslan.spring.diplom.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.DeviceType;

import java.util.List;

@Data
@AllArgsConstructor
public class DeviceModelResponseInfoDto {
    private Long id;

    private String name;

    private String manufacturer;

    private DeviceType type;


}
