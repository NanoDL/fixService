package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.DeviceModel;

import java.util.Optional;

@Repository
public interface DeviceModelRepository extends JpaRepository<DeviceModel,Long> {

    Optional<DeviceModel> findById(Long id);

}
