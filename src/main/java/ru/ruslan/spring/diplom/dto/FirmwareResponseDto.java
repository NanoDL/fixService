package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.MyUser;

import java.util.Date;
import java.util.List;
@Data
@AllArgsConstructor
public class FirmwareResponseDto {
    private Long id;

    private String name;

    private String description;

    private String version;

    private DeviceType deviceType;

    private String manufacturer;

    private String fileUrl;

    private List<DeviceModelResponseInfoDto> compatibleDevices;

    private Date uploadDate;

    private MyUser uploadedBy;

    private MyUser updatedBy;
}
