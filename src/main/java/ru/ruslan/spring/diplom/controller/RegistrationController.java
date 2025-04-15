package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
import ru.ruslan.spring.diplom.security.JWTUtil;
import ru.ruslan.spring.diplom.service.AdminRegistrationService;
import ru.ruslan.spring.diplom.service.CustomerRegistrationService;
import ru.ruslan.spring.diplom.service.MasterRegistrationService;

import java.util.Map;


public class RegistrationController {

    /*private final CustomerRegistrationService customerRegistrationService;
    private final MasterRegistrationService masterRegistrationService;
    private final AdminRegistrationService adminRegistrationService;
    private final JWTUtil jwtUtil;

    @Autowired
    public RegistrationController(CustomerRegistrationService customerRegistrationService, MasterRegistrationService masterRegistrationService, AdminRegistrationService adminRegistrationService, JWTUtil jwtUtil) {
        this.customerRegistrationService = customerRegistrationService;
        this.masterRegistrationService = masterRegistrationService;
        this.adminRegistrationService = adminRegistrationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/customer")
    public Map<String, String> registerCustomer(@Valid @RequestBody CustomerRegistrationDto dto) {
        Customer customer = customerRegistrationService.registerCustomer(dto);
        String token = jwtUtil.generateToken(dto.getUsername());
        return Map.of("jwt-token", token);
    }

    @PostMapping("/master")
    public Map<String, String> registerMaster(@Valid @RequestBody MasterRegistrationDto dto) {

        Master master = masterRegistrationService.registerMaster(dto);
        String token = jwtUtil.generateToken(dto.getUsername());

        return Map.of("jwt-token", token);
    }

    @PostMapping("/admin")
    public Map<String, String> registerAdmin(@Valid @RequestBody AdminRegistrationDto dto) {
        Admin admin = adminRegistrationService.registerAdmin(dto);
        String token = jwtUtil.generateToken(dto.getUsername());

        return Map.of("jwt-token", token);
    }*/

}
