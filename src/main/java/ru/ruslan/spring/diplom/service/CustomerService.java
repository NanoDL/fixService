package ru.ruslan.spring.diplom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.CustomerRepository;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказчик не найден"));
    }

    public Customer findByUserId(Long userId) {
        return customerRepository.findByMyUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Заказчик не найден"));
    }

    public Customer findByMyUser(MyUser myUser) {
        return customerRepository.findByMyUser(myUser);
    }
}
