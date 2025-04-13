package ru.ruslan.spring.diplom.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import ru.ruslan.spring.diplom.service.MyUserDetailService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final MyUserDetailService myUserDetailService;

    @Autowired
    public SecurityConfig(MyUserDetailService myUserDetailService) {
        this.myUserDetailService = myUserDetailService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
        //return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String[] allowed = {"/swagger-ui/**", "/login", "/", "/swApi"};

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                /*.requestMatchers("/", "/login","/login/**","/login/*.html", "/logout", "/api/register/**", "/register/**", "/admin/register","/admin/register/**", "/admin/register/*.html").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/static/**", "/*.html", "/admin/*.html", "/swApi").permitAll()*/
                   // .requestMatchers(allowed).permitAll()
                .anyRequest().permitAll()
            )
            /*.formLogin(form -> form
                .loginPage("/login/index.html")
                .loginProcessingUrl("/login/index.html")
                .defaultSuccessUrl("/admin/dashboard", true)
                .permitAll()
            )*/
                .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
