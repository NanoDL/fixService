package ru.ruslan.spring.diplom.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.CustomerRegistrationDto;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.CustomerRepository;
import ru.ruslan.spring.diplom.repository.MyUserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerRegistrationService {

    private final MyUserRepository myUserRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Customer registerCustomer(CustomerRegistrationDto dto) {
        // Проверяем, не существует ли уже пользователь с таким username или email
        if (myUserRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        if (myUserRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");

        }

        // Создаем пользователя
        MyUser myUser = new MyUser();
        myUser.setUsername(dto.getUsername());
        myUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        myUser.setEmail(dto.getEmail());
        myUser.setRole(UserRole.CUSTOMER);
        myUser.setActive(true);

        // Сохраняем пользователя
        myUser = myUserRepository.save(myUser);

        // Создаем профиль клиента
        Customer customer = new Customer();
        customer.setMyUser(myUser);
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setAddress(dto.getAddress());
        customer.setBio(dto.getBio());
        customer.setLastLoginAt(LocalDateTime.now());
        customer.setVerified(false);
        customer.setBlocked(false);

        // Сохраняем клиента
        return customerRepository.save(customer);
    }
} 