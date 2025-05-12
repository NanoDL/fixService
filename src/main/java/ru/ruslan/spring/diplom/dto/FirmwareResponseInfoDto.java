package ru.ruslan.spring.diplom.dto;

import lombok.Data;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.MyUser;

import java.util.Date;
import java.util.List;
@Data
public class FirmwareResponseInfoDto {
    private Long id;

    private String name;

    private String description;

    private String version;

    private DeviceType deviceType;

    private String manufacturer;

    private String fileUrl;

    private Date uploadDate;

    private MyUser uploadedBy;

    private MyUser updatedBy;
}
