package ru.ruslan.spring.diplom.service;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.AdminRegistrationDto;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.Admin;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.AdminRepository;
import ru.ruslan.spring.diplom.repository.MyUserRepository;

@Service
public class AdminRegistrationService {

    private final ModelMapper modelMapper;
    private MyUserRepository myUserRepository;
    private AdminRepository adminRepository;
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Admin registerAdmin(AdminRegistrationDto dto){

        if (myUserRepository.existsByUsername(dto.getUsername())){
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        if (myUserRepository.existsByEmail(dto.getEmail())){
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        // Создаем пользователя
        MyUser myUser = new MyUser();
        myUser.setUsername(dto.getUsername());
        myUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        myUser.setEmail(dto.getEmail());
        myUser.setRole(UserRole.ADMIN);
        myUser.setActive(true);

        // Сохраняем пользователя
        myUser = myUserRepository.save(myUser);

        Admin admin = new Admin();
        admin.setMyUser(myUser);
        admin.setFirstName(dto.getFirstName());
        admin.setLastName(dto.getLastName());
        admin.setNotes(dto.getNotes());
        return adminRepository.save(admin);
    }

    public AdminRegistrationService(ModelMapper modelMapper, MyUserRepository myUserRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.modelMapper = modelMapper;
        this.myUserRepository = myUserRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }
}
