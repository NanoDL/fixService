package ru.ruslan.spring.diplom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.security.MyUserDetails;
import ru.ruslan.spring.diplom.service.AdminRegistrationService;
import ru.ruslan.spring.diplom.service.AdminService;
import ru.ruslan.spring.diplom.service.CustomerService;
import ru.ruslan.spring.diplom.service.MyUserService;


public class HelloController {

    private MyUserService myUserService;

    @GetMapping
    public ResponseEntity<String> hello() {
        MyUser myUser = myUserService.getUserFromContext();
        String response = String.format("Добро пожаловать, %s! Ваша роль: %s",
                myUser.getUsername(),
                myUser.getRole().name());
            
        return ResponseEntity.ok(response);
    }
}
