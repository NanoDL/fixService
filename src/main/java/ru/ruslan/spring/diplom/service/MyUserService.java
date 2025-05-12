package ru.ruslan.spring.diplom.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.UserForAdminDto;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.security.MyUserDetails;
import ru.ruslan.spring.diplom.util.UserNotFoundException;
import ru.ruslan.spring.diplom.repository.MyUserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MyUserService {
    @Autowired
    private MyUserRepository myUserRepository;

    public Page<UserForAdminDto> findAll(Pageable pageable){

        Page<MyUser> users = myUserRepository.findAllByRoleNot(UserRole.ADMIN,pageable);

        return users.map(user -> {
           return new UserForAdminDto(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getCreatedAt(),
                    user.isActive());
        } );
    }

    public MyUser getUserById(Long id){
        Optional<MyUser> user = Optional.ofNullable(myUserRepository.getUserById(id));
        return user.orElseThrow(UserNotFoundException::new);
    }

    public MyUser findUserByUsername(String username){
        Optional<MyUser> user = Optional.ofNullable(myUserRepository.findByUsername(username));
        return  user.orElseThrow(UserNotFoundException::new);
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

    @Transactional
    public boolean toggleStatus(Long id) {
        MyUser user = getUserById(id);

        user.setActive(!user.isActive());
        myUserRepository.save(user);
        return user.isActive();
    }
}
