package ru.ruslan.spring.diplom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {




    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Completely disable CSRF protection for Swagger and other public endpoints
                .csrf(AbstractHttpConfigurer::disable)

                // Configure authorization
                .authorizeHttpRequests(authorize -> authorize
                        // Permit all access to Swagger and related endpoints
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/swApi/**",
                                "/error"
                        ).permitAll()

                        // Optionally, add any other public endpoints here
                        // .requestMatchers("/public/**").permitAll()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Configure authentication method
                .httpBasic(Customizer.withDefaults())

                // Optional: If you're using form login
                .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
