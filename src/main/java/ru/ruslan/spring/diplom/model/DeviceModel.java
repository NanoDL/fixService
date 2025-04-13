package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.DeviceType;

import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "device_models")
public class DeviceModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @NotBlank
    private String name;
    
    private String manufacturer;
    
    @Enumerated(EnumType.STRING)
    private DeviceType type;
    
    @ManyToMany(mappedBy = "compatibleDevices")
    private List<Firmware> compatibleFirmwares;
}
