package ru.ruslan.spring.diplom.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.model.User;
import ru.ruslan.spring.diplom.repository.UserRepository;

import java.util.List;

@Service
@Transactional(readOnly = false)
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> findAll(){
        return userRepository.findAll();
    }

    public User save(User user){
        return userRepository.save(user);
    }
}
