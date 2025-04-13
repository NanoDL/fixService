package ru.ruslan.spring.diplom.repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.Firmware;
@Repository
public interface FirmwareRepository extends JpaRepository<Firmware, Long> {
}
