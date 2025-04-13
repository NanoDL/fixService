package ru.ruslan.spring.diplom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.BaseProfileDto;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.service.MyUserService;
import ru.ruslan.spring.diplom.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final MyUserService myUserService;
    private final ProfileService profileService;

    @Autowired
    public ProfileController(MyUserService myUserService, ProfileService profileService) {
        this.myUserService = myUserService;
        this.profileService = profileService;
    }

    @GetMapping
    public BaseProfileDto getProfile() {
        MyUser user = myUserService.getUserFromContext();
        return profileService.getUserProfile(user);
    }
}
