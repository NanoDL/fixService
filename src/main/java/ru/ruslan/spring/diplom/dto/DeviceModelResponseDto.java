package ru.ruslan.spring.diplom.dto;


import jakarta.persistence.ManyToMany;
import ru.ruslan.spring.diplom.model.Firmware;

import java.util.List;

public class DeviceModelResponseDto {
    private String name;

    private String manufacturer;

    private String type;

    private List<Firmware> compatibleFirmwares;
}
