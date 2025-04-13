package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import ru.ruslan.spring.diplom.enums.OrderStatus;
import ru.ruslan.spring.diplom.enums.RepairType;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Master;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
public class OrderResponseDto {

    private Long id;

    private DeviceModel device;

    private OrderStatus status;

    private RepairType repairType;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private BigDecimal price;

    private String description;
}
