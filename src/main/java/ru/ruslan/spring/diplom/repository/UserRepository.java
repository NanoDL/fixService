package ru.ruslan.spring.diplom.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.User;

import java.util.List;
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

}
