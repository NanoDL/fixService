package ru.ruslan.spring.diplom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ruslan.spring.diplom.dto.AuthenticationDto;
import ru.ruslan.spring.diplom.security.JWTUtil;

import java.util.Map;

public class LoginController {

    /*private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager, JWTUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
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

    }*/
}
