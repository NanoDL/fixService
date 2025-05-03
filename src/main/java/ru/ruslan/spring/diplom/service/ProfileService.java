package ru.ruslan.spring.diplom.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.*;
import ru.ruslan.spring.diplom.exception.InvalidPasswordException;
import ru.ruslan.spring.diplom.exception.ProfileNotFoundException;
import ru.ruslan.spring.diplom.model.*;
import ru.ruslan.spring.diplom.repository.*;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final MyUserRepository myUserRepository;
    private final CustomerRepository customerRepository;
    private final MasterRepository masterRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public BaseProfileDto getUserProfile(MyUser user) {
        return switch (user.getRole()) {
            case CUSTOMER -> mapToCustomerDto(user, findCustomerOrThrow(user));
            case MASTER -> mapToMasterDto(user, findMasterOrThrow(user));
            case ADMIN -> mapToAdminDto(user, findAdminOrThrow(user));
        };
    }
    
    @Transactional
    public BaseProfileDto updateProfile(MyUser user, BaseProfileDto profileDto) {
        return switch (user.getRole()) {
            case CUSTOMER -> updateCustomerProfile(user, (CustomerProfileDto) profileDto);
            case MASTER -> updateMasterProfile(user, (MasterProfileDto) profileDto);
            case ADMIN -> updateAdminProfile(user, (AdminProfileDto) profileDto);
        };
    }
    
    @Transactional
    public void changePassword(MyUser user, PasswordChangeDto passwordChangeDto) {
        if (!passwordEncoder.matches(passwordChangeDto.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Текущий пароль указан неверно");
        }
        
        user.setPassword(passwordEncoder.encode(passwordChangeDto.getNewPassword()));
        myUserRepository.save(user);
    }
    
    @Transactional
    public void deleteAccount(MyUser user, PasswordConfirmationDto confirmationDto) {
        if (!passwordEncoder.matches(confirmationDto.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Пароль указан неверно");
        }
        
        // Помечаем пользователя как неактивного вместо полного удаления
        user.setActive(false);
        myUserRepository.save(user);
    }
    
    private CustomerProfileDto updateCustomerProfile(MyUser user, CustomerProfileDto profileDto) {
        Customer customer = findCustomerOrThrow(user);
        
        customer.setFirstName(profileDto.getFirstName());
        customer.setLastName(profileDto.getLastName());
        customer.setPhoneNumber(profileDto.getPhoneNumber());
        customer.setAddress(profileDto.getAddress());
        customer.setBio(profileDto.getBio());
        
        customerRepository.save(customer);
        return mapToCustomerDto(user, customer);
    }
    
    private MasterProfileDto updateMasterProfile(MyUser user, MasterProfileDto profileDto) {
        Master master = findMasterOrThrow(user);
        
        master.setName(profileDto.getName());
        master.setPhoneNumber(profileDto.getPhoneNumber());
        master.setAddress(profileDto.getAddress());
        master.setSpecialization(profileDto.getSpecialization());
        master.setExperienceYears(profileDto.getExperienceYears());
        master.setPrice(profileDto.getPrice());
        master.setDescription(profileDto.getDescription());
        
        masterRepository.save(master);
        return mapToMasterDto(user, master);
    }
    
    private AdminProfileDto updateAdminProfile(MyUser user, AdminProfileDto profileDto) {
        Admin admin = findAdminOrThrow(user);
        
        admin.setFirstName(profileDto.getFirstName());
        admin.setLastName(profileDto.getLastName());
        admin.setNotes(profileDto.getNotes());
        
        adminRepository.save(admin);
        return mapToAdminDto(user, admin);
    }
    
    private Customer findCustomerOrThrow(MyUser user) {
        return customerRepository.findByMyUser(user)
                .orElseThrow(() -> new ProfileNotFoundException("Профиль заказчика не найден"));
    }
    
    private Master findMasterOrThrow(MyUser user) {
        return masterRepository.findByMyUser(user)
                .orElseThrow(() -> new ProfileNotFoundException("Профиль мастера не найден"));
    }
    
    private Admin findAdminOrThrow(MyUser user) {
        return adminRepository.findByMyUser(user)
                .orElseThrow(() -> new ProfileNotFoundException("Профиль администратора не найден"));
    }

    private CustomerProfileDto mapToCustomerDto(MyUser user, Customer customer) {
        CustomerProfileDto dto = new CustomerProfileDto();
        mapBaseFields(user, dto);
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setAddress(customer.getAddress());
        dto.setBio(customer.getBio());
        dto.setAvatarUrl(customer.getAvatarUrl());
        dto.setIsVerified(customer.isVerified());
        dto.setIsBlocked(customer.isBlocked());
        return dto;
    }

    private MasterProfileDto mapToMasterDto(MyUser user, Master master) {
        MasterProfileDto dto = new MasterProfileDto();
        mapBaseFields(user, dto);
        dto.setName(master.getName());
        dto.setAddress(master.getAddress());
        dto.setPhoneNumber(master.getPhoneNumber());
        dto.setSpecialization(master.getSpecialization());
        dto.setExperienceYears(master.getExperienceYears());
        dto.setRating(master.getRating());
        dto.setPrice(master.getPrice());
        dto.setDescription(master.getDescription());
        return dto;
    }

    private AdminProfileDto mapToAdminDto(MyUser user, Admin admin) {
        AdminProfileDto dto = new AdminProfileDto();
        mapBaseFields(user, dto);
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setNotes(admin.getNotes());
        dto.setIsSuperAdmin(admin.isSuperAdmin());
        return dto;
    }

    private void mapBaseFields(MyUser user, BaseProfileDto dto) {
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setRegistrationDate(user.getCreatedAt());
    }
}
