package ru.ruslan.spring.diplom.enums;

public enum RepairType {
    DIAGNOSTIC("Диагностика"),
    HARDWARE_REPAIR("Ремонт оборудования"),
    SOFTWARE_REPAIR("Ремонт ПО"),
    FIRMWARE_UPDATE("Обновление прошивки"),
    CLEANING("Чистка"),
    REPLACEMENT("Замена деталей"),
    COMPLEX_REPAIR("Комплексный ремонт");

    private final String displayName;

    RepairType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 