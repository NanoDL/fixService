package ru.ruslan.spring.diplom.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.security.MyUserDetails;
import ru.ruslan.spring.diplom.util.UserNotFoundException;
import ru.ruslan.spring.diplom.repository.MyUserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MyUserService {
    @Autowired
    private MyUserRepository myUserRepository;

    public List<MyUser> findAll(){
        return myUserRepository.findAll();
    }

    public MyUser getUserById(Long id){
        Optional<MyUser> user = Optional.ofNullable(myUserRepository.getUserById(id));
        return user.orElseThrow(UserNotFoundException::new);
    }

    public MyUser getUserFromContext(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Вы не авторизовались!");
        }

        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
        return userDetails.getMyUser();
    }
    @Transactional
    public MyUser save(MyUser myUser){
        return myUserRepository.save(myUser);
    }
}
