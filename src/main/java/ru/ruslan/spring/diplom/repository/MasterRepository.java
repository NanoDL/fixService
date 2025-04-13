package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.model.MyUser;

import java.util.Optional;

@Repository
public interface MasterRepository extends JpaRepository<Master, Long> {
    Optional<Master> findByMyUser_Id(Long userId);
    Master findByMyUser(MyUser myUser);
}
