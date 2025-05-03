package ru.ruslan.spring.diplom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.MasterRepository;

@Service
public class MasterService {
    private final MasterRepository masterRepository;

    @Autowired
    public MasterService(MasterRepository masterRepository) {
        this.masterRepository = masterRepository;
    }

    public Master findById(Long id) {
        return masterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Мастер не найден"));
    }

    public Master findByUserId(Long userId) {
        return masterRepository.findByMyUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Мастер не найден"));
    }

    public Master findByMyUser(MyUser myUser) {
        return masterRepository.findByMyUser(myUser).orElseThrow(()-> new RuntimeException("Мастер не найден"));
    }
}
