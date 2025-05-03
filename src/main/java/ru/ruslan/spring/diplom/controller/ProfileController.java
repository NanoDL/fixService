package ru.ruslan.spring.diplom.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.BaseProfileDto;
import ru.ruslan.spring.diplom.dto.PasswordChangeDto;
import ru.ruslan.spring.diplom.dto.PasswordConfirmationDto;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.service.ProfileService;
import ru.ruslan.spring.diplom.service.MyUserService;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final MyUserService myUserService;
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<BaseProfileDto> getProfile() {
        MyUser user = myUserService.getUserFromContext();
        BaseProfileDto profileDto = profileService.getUserProfile(user);
        return ResponseEntity.ok(profileDto);
    }

    @PutMapping
    public ResponseEntity<BaseProfileDto> updateProfile(@RequestBody BaseProfileDto profileDto) {
        MyUser user = myUserService.getUserFromContext();
        BaseProfileDto updatedProfile = profileService.updateProfile(user, profileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeDto passwordChangeDto) {
        MyUser user = myUserService.getUserFromContext();
        profileService.changePassword(user, passwordChangeDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(@RequestBody PasswordConfirmationDto confirmationDto) {
        MyUser user = myUserService.getUserFromContext();
        profileService.deleteAccount(user, confirmationDto);
        return ResponseEntity.ok().build();
    }
}
