package ru.ruslan.spring.diplom.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.dto.UserDTO;
import ru.ruslan.spring.diplom.service.MyUserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Пользователи", description = "Управление пользователями")
public class UserController {

    private MyUserService myUserService;
    private ModelMapper modelMapper;

    @Autowired
    public UserController(MyUserService myUserService, ModelMapper modelMapper) {
        this.myUserService = myUserService;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public List<MyUser> getAll(){
        return myUserService.findAll();
    }

    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id){
        return convertUserToDTO(myUserService.getUserById(id));
    }



    @PostMapping
    public MyUser addUser(@RequestBody @Validated UserDTO user){
        return myUserService.save(convertDTOToUser(user));
    }

    private UserDTO convertUserToDTO(MyUser myUser){
        return modelMapper.map(myUser, UserDTO.class);
    }

    private MyUser convertDTOToUser(UserDTO userDTO){
        MyUser myUser = modelMapper.map(userDTO, MyUser.class);
        return myUser;
    }
}
