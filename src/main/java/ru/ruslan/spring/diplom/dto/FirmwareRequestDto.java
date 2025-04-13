package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Master;

import java.util.Date;
import java.util.List;

@Data
public class FirmwareRequestDto {

    @NotBlank
    private String name;

    private String description;

    private String version;

    @Enumerated(value = EnumType.STRING)
    private DeviceType deviceType;

    private String manufacturer;

    private String fileUrl;

    @ManyToMany
    @JoinTable(
            name = "firmware_device_models",
            joinColumns = @JoinColumn(name = "firmware_id"),
            inverseJoinColumns = @JoinColumn(name = "device_model_id")
    )
    private List<DeviceModel> compatibleDevices;
}
