package ru.ruslan.spring.diplom.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.ruslan.spring.diplom.enums.DeviceType;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceModelResponseInfoDto {
    private Long id;

    private String name;

    private String manufacturer;

    private DeviceType type;


}
