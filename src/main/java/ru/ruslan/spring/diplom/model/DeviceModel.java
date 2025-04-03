package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "device_models")
public class DeviceModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String manufacturer;
    
    private String type;
    
    @ManyToMany(mappedBy = "compatibleDevices")
    private List<Firmware> compatibleFirmwares;
}
