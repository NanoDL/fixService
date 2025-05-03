package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.MyUser;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByMyUser_Id(Long userId);
    Optional<Customer> findByMyUser(MyUser myUser);
}
