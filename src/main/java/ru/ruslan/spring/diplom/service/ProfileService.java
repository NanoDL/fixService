package ru.ruslan.spring.diplom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.ruslan.spring.diplom.dto.*;
import ru.ruslan.spring.diplom.model.*;
import ru.ruslan.spring.diplom.repository.*;

@Service
public class ProfileService {
    private final MyUserRepository myUserRepository;
    private final CustomerRepository customerRepository;
    private final MasterRepository masterRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public ProfileService(MyUserRepository myUserRepository,
                         CustomerRepository customerRepository,
                         MasterRepository masterRepository,
                         AdminRepository adminRepository) {
        this.myUserRepository = myUserRepository;
        this.customerRepository = customerRepository;
        this.masterRepository = masterRepository;
        this.adminRepository = adminRepository;
    }

    public BaseProfileDto getUserProfile(MyUser user) {
        switch (user.getRole()) {
            case CUSTOMER -> {
                Customer customer = customerRepository.findByMyUser(user);
                if (customer != null) {
                    return mapToCustomerDto(user, customer);
                }
                return null;
            }
            case MASTER -> {
                Master master = masterRepository.findByMyUser(user);
                if (master != null) {
                    return mapToMasterDto(user, master);
                }
                return null;
            }
            case ADMIN -> {
                Admin admin = adminRepository.findByMyUser(user);
                if (admin != null) {
                    return mapToAdminDto(user, admin);
                }
                return null;
            }
        }
        return null;
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
    }
}
