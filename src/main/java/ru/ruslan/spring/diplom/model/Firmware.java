package ru.ruslan.spring.diplom.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import ru.ruslan.spring.diplom.enums.DeviceType;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "firmwares")
public class Firmware {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @NotBlank
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String version;
    
    @Column(name = "device_type")
    @Enumerated(value = EnumType.STRING)
    private DeviceType deviceType;
    
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
    @JoinColumn(name = "upload_user_id")
    private MyUser uploadedBy;

    @ManyToOne
    @JoinColumn(name = "update_user_id")
    private MyUser updatedBy;
}
