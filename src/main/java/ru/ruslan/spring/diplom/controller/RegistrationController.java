package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ruslan.spring.diplom.dto.AdminRegistrationDto;
import ru.ruslan.spring.diplom.dto.CustomerRegistrationDto;
import ru.ruslan.spring.diplom.dto.MasterRegistrationDto;
import ru.ruslan.spring.diplom.model.Admin;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.service.AdminRegistrationService;
import ru.ruslan.spring.diplom.service.CustomerRegistrationService;
import ru.ruslan.spring.diplom.service.MasterRegistrationService;

@RestController
@RequestMapping("/api/register")
@RequiredArgsConstructor
public class RegistrationController {
    
    private final CustomerRegistrationService customerRegistrationService;
    private final MasterRegistrationService masterRegistrationService;
    private final AdminRegistrationService adminRegistrationService;

    @PostMapping("/customer")
    public ResponseEntity<Customer> registerCustomer(@Valid @RequestBody CustomerRegistrationDto dto) {
        Customer customer = customerRegistrationService.registerCustomer(dto);
        return ResponseEntity.ok(customer);
    }

    @PostMapping("/master")
    public ResponseEntity<Master> registerMaster(@Valid @RequestBody MasterRegistrationDto dto) {

        Master master = masterRegistrationService.registerMaster(dto);

        return ResponseEntity.ok(master);
    }
    @PostMapping("/admin")
    public ResponseEntity<Admin> registerAdmin(@Valid @RequestBody AdminRegistrationDto dto) {
        Admin admin = adminRegistrationService.registerAdmin(dto);

        return ResponseEntity.ok(admin);
    }
}
