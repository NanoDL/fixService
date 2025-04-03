package ru.ruslan.spring.diplom.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "firmwares")
public class Firmware {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String version;
    
    @Column(name = "device_type")
    private String deviceType;
    
    private String manufacturer;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @ManyToMany
    @JoinTable(
        name = "firmware_device_models",
        joinColumns = @JoinColumn(name = "firmware_id"),
        inverseJoinColumns = @JoinColumn(name = "device_model_id")
    )
    private List<DeviceModel> compatibleDevices;
    
    @CreationTimestamp
    @Column(name = "upload_date")
    private Date uploadDate;
    
    @ManyToOne
    @JoinColumn(name = "master_id")
    private Master uploadedBy;
}
