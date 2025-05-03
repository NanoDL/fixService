package ru.ruslan.spring.diplom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.ruslan.spring.diplom.model.Admin;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.AdminRepository;

@Service
public class AdminService {
    private final AdminRepository adminRepository;

    @Autowired
    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public Admin findByUser_Id(Long id){
        return adminRepository.findByMyUser_Id(id)
                .orElseThrow(() -> new RuntimeException("Нет такого админа!"));
    }

    public Admin findByMyUser(MyUser myUser) {
        return adminRepository.findByMyUser(myUser)
                .orElseThrow(() -> new RuntimeException("Нет такого админа!"));
    }
}
