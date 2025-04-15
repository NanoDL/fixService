package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ruslan.spring.diplom.dto.AdminRegistrationDto;
import ru.ruslan.spring.diplom.dto.AuthenticationDto;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomerRegistrationService customerRegistrationService;
    private final MasterRegistrationService masterRegistrationService;
    private final AdminRegistrationService adminRegistrationService;
    private final JWTUtil jwtUtil;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, CustomerRegistrationService customerRegistrationService, MasterRegistrationService masterRegistrationService, AdminRegistrationService adminRegistrationService, JWTUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.customerRegistrationService = customerRegistrationService;
        this.masterRegistrationService = masterRegistrationService;
        this.adminRegistrationService = adminRegistrationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody AuthenticationDto authenticationDto){
        System.out.println(authenticationDto.getUsername() + authenticationDto.getPassword());
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(authenticationDto.getUsername(), authenticationDto.getPassword());
        try{
            authenticationManager.authenticate(authenticationToken);
        } catch (BadCredentialsException e){
            return Map.of("message", "Incorrect credentials!");
        }

        String token = jwtUtil.generateToken(authenticationDto.getUsername());
        System.out.println(token);
        return  Map.of("jwt-token", token);

    }

    @PostMapping("/register/customer")
    public Map<String, String> registerCustomer(@Valid @RequestBody CustomerRegistrationDto dto) {
        Customer customer = customerRegistrationService.registerCustomer(dto);
        String token = jwtUtil.generateToken(dto.getUsername());
        return Map.of("jwt-token", token);
    }

    @PostMapping("/register/master")
    public Map<String, String> registerMaster(@Valid @RequestBody MasterRegistrationDto dto) {

        Master master = masterRegistrationService.registerMaster(dto);
        String token = jwtUtil.generateToken(dto.getUsername());

        return Map.of("jwt-token", token);
    }

    @PostMapping("/register/admin")
    public Map<String, String> registerAdmin(@Valid @RequestBody AdminRegistrationDto dto) {
        Admin admin = adminRegistrationService.registerAdmin(dto);
        String token = jwtUtil.generateToken(dto.getUsername());

        return Map.of("jwt-token", token);
    }
}
