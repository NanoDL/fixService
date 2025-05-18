package ru.ruslan.spring.diplom.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.*;
import ru.ruslan.spring.diplom.dto.CustomerProfileDto;
import ru.ruslan.spring.diplom.dto.MasterProfileDto;
import ru.ruslan.spring.diplom.dto.AdminProfileDto;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.repository.MasterRepository;
import ru.ruslan.spring.diplom.service.ProfileService;
import ru.ruslan.spring.diplom.service.MyUserService;
import ru.ruslan.spring.diplom.enums.UserRole;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final MyUserService myUserService;
    private final ProfileService profileService;
    private final MasterRepository masterRepository;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        MyUser user = myUserService.getUserFromContext();
        BaseProfileDto profileDto = profileService.getUserProfile(user);
        
        // Возвращаем полную информацию о профиле в зависимости от роли
        switch (user.getRole()) {
            case CUSTOMER:
                return ResponseEntity.ok((CustomerProfileDto) profileDto);
            case MASTER:{
                System.out.println("MASTER PROFILE DETAILS:");
                System.out.println("Email: " + profileDto.getEmail());
                System.out.println("Username: " + profileDto.getUsername());
                MasterProfileDto masterDto = (MasterProfileDto) profileDto;
                System.out.println("Name: " + masterDto.getName());
                System.out.println("Phone: " + masterDto.getPhoneNumber());
                System.out.println("Address: " + masterDto.getAddress());
                System.out.println("Specialization: " + masterDto.getSpecialization());
                System.out.println("Experience: " + masterDto.getExperienceYears());
                System.out.println("Rating: " + masterDto.getRating());
                System.out.println("Price: " + masterDto.getPrice());
                System.out.println("Description: " + masterDto.getDescription());
                System.out.println("Is Available: " + masterDto.getIsAvailable());
                return ResponseEntity.ok(masterDto);
            }
            case ADMIN:
                return ResponseEntity.ok((AdminProfileDto) profileDto);
            default:
                return ResponseEntity.ok(profileDto);
        }
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

    @GetMapping("/test-master")
    public ResponseEntity<String> createTestMasterProfile() {
        try {
            MyUser user = myUserService.getUserFromContext();
            
            if (user.getRole() != UserRole.MASTER) {
                return ResponseEntity.badRequest().body("Пользователь не является мастером");
            }
            
            Master master = masterRepository.findByMyUser(user).orElse(null);
            if (master == null) {
                return ResponseEntity.badRequest().body("Профиль мастера не найден");
            }
            
            // Заполняем тестовыми данными
            master.setName("Тестовый Мастер");
            master.setAddress("ул. Тестовая, д. 123");
            master.setPhoneNumber("+7 (999) 123-45-67");
            master.setSpecialization("Тестовая специализация");
            master.setExperienceYears(5);
            master.setRating(4.5);
            master.setPrice(new BigDecimal("1500.00"));
            master.setDescription("Тестовое описание услуг мастера");
            master.setAvailable(true);
            
            masterRepository.save(master);
            
            return ResponseEntity.ok("Тестовый профиль мастера создан");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка: " + e.getMessage());
        }
    }
}
