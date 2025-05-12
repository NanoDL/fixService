package ru.ruslan.spring.diplom.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNullApi;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.MyUser;

@Repository
public interface MyUserRepository extends JpaRepository<MyUser, Long> {

    MyUser getUserById(Long id);

    MyUser findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<MyUser> findAllByRoleNot(UserRole role, Pageable pageable);


}
