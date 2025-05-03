package ru.ruslan.spring.diplom.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;

import java.util.Optional;

@Repository
public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {

    Optional<DeviceModel> findById(Long id);

    // Методы с комбинацией фильтров
    Page<DeviceModel> findByTypeAndManufacturerAndNameContainingIgnoreCase(DeviceType type, String manufacturer, String name, Pageable pageable);
    Page<DeviceModel> findByTypeAndManufacturer(DeviceType type, String manufacturer, Pageable pageable);
    Page<DeviceModel> findByTypeAndNameContainingIgnoreCase(DeviceType type, String name, Pageable pageable);
    Page<DeviceModel> findByManufacturerAndNameContainingIgnoreCase(String manufacturer, String name, Pageable pageable);
    
    // Методы с одним фильтром
    Page<DeviceModel> findByType(DeviceType type, Pageable pageable);
    Page<DeviceModel> findByManufacturer(String manufacturer, Pageable pageable);
    Page<DeviceModel> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
