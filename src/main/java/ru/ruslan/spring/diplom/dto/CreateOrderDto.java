package ru.ruslan.spring.diplom.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.ruslan.spring.diplom.enums.RepairType;

import java.math.BigDecimal;

@Data
public class CreateOrderDto {

    private Long deviceModelId;

    @NotNull(message = "Тип ремонта обязателен")
    private RepairType repairType;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.0", message = "Цена не может быть отрицательной")
    private BigDecimal price;

    private String description;
} 