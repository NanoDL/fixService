package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.Admin;
import ru.ruslan.spring.diplom.model.MyUser;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByMyUser_Id(Long Id);
    Optional<Admin> findByMyUser(MyUser myUser);
}
