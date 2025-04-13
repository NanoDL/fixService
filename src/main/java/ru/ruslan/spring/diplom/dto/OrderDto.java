package ru.ruslan.spring.diplom.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import org.hibernate.annotations.CreationTimestamp;
import ru.ruslan.spring.diplom.enums.OrderStatus;
import ru.ruslan.spring.diplom.enums.RepairType;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Master;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDto {

    private Customer customer;

    private Master master;

    private DeviceModel device;

    private OrderStatus status;

    private RepairType repairType;

    @DecimalMin(value = "0.0", message = "Цена не может быть отрицательной")
    private BigDecimal price;

    private String description;

}
