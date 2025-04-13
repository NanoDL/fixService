package ru.ruslan.spring.diplom.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.MasterRegistrationDto;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.MasterRepository;
import ru.ruslan.spring.diplom.repository.MyUserRepository;

@Service
@RequiredArgsConstructor
public class MasterRegistrationService {
    
    private final MyUserRepository myUserRepository;
    private final MasterRepository masterRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Master registerMaster(MasterRegistrationDto dto) {
        // Проверяем, не существует ли уже пользователь с таким username или email
        if (myUserRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        if (myUserRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        // Создаем пользователя
        MyUser myUser = new MyUser();
        myUser.setUsername(dto.getUsername());
        myUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        myUser.setEmail(dto.getEmail());
        myUser.setRole(UserRole.MASTER);
        myUser.setActive(true);
        
        // Сохраняем пользователя
        myUser = myUserRepository.save(myUser);

        // Создаем профиль мастера
        Master master = new Master();
        master.setMyUser(myUser);
        master.setName(dto.getName());
        master.setAddress(dto.getAddress());
        master.setPhoneNumber(dto.getPhoneNumber());
        master.setSpecialization(dto.getSpecialization());
        master.setExperienceYears(dto.getExperienceYears());
        master.setPrice(dto.getPrice());
        master.setDescription(dto.getDescription());
        master.setAvailable(true);
        master.setRating(0.0);

        // Сохраняем мастера
        return masterRepository.save(master);
    }
} 