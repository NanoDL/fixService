package ru.ruslan.spring.diplom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.MyUserRepository;
import ru.ruslan.spring.diplom.security.MyUserDetails;

import java.util.Optional;

@Service
public class MyUserDetailService implements UserDetailsService {
    @Autowired
    private MyUserRepository myUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<MyUser> user = Optional.ofNullable(myUserRepository.findByUsername(username));

        if (user.isEmpty()){
            throw new UsernameNotFoundException("Нет такого пользователя");
        }
        return new MyUserDetails(user.get());
    }
}
