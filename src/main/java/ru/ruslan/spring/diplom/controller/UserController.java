package ru.ruslan.spring.diplom.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.model.User;
import ru.ruslan.spring.diplom.dto.UserDTO;
import ru.ruslan.spring.diplom.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Пользователи", description = "Управление пользователями")
public class UserController {

    private UserService userService;
    private ModelMapper modelMapper;

    @Autowired
    public UserController(UserService userService, ModelMapper modelMapper) {
        this.userService = userService;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll(){
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<User> save(@RequestBody @Validated UserDTO user) {
        return ResponseEntity.ok(userService.save(convertDTOToUser(user)));
    }

    private UserDTO convertUserToDTO(User user){
        return modelMapper.map(user, UserDTO.class);
    }

    private User convertDTOToUser(UserDTO userDTO){
        User user = modelMapper.map(userDTO, User.class);
        return user;
    }
}
