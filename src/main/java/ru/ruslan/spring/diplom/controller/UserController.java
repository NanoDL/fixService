package ru.ruslan.spring.diplom.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.UserForAdminDto;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.dto.UserDTO;
import ru.ruslan.spring.diplom.service.MyUserService;
import ru.ruslan.spring.diplom.util.UserErrorResponse;
import ru.ruslan.spring.diplom.util.UserNotFoundException;

import java.util.ArrayList;
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
    public Page<UserForAdminDto> getAll(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size){
        return myUserService.findAll(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id){
        return convertUserToDTO(myUserService.getUserById(id));
    }

    @PostMapping("/{id}/toggle-status")
    public void toggleUserStatus(@PathVariable Long id){
        myUserService.toggleStatus(id);
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

    @ExceptionHandler
    public ResponseEntity<UserErrorResponse> handleException(UserNotFoundException e){

        UserErrorResponse response = new UserErrorResponse(
                "User not found!", System.currentTimeMillis()
        );

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
}
