package ru.ruslan.spring.diplom.config;


import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.ruslan.spring.diplom.security.JWTUtil;
import ru.ruslan.spring.diplom.security.MyUserDetails;
import ru.ruslan.spring.diplom.service.MyUserDetailService;

import java.io.IOException;
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final MyUserDetailService myUserDetailService;

    @Autowired
    public JwtFilter(JWTUtil jwtUtil, MyUserDetailService myUserDetailService) {
        this.jwtUtil = jwtUtil;
        this.myUserDetailService = myUserDetailService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && !authHeader.isBlank() && authHeader.startsWith("Bearer ")){
            String jwt = authHeader.substring(7);

            if (jwt.isBlank()){
                response.sendError(HttpServletResponse.SC_BAD_REQUEST,
                        "Токен JWT неправильный");
            } else {
                try {


                    String username = jwtUtil.validateTokenAndRetrieveClaim(jwt);
                    UserDetails userDetails = myUserDetailService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(),
                                    userDetails.getAuthorities());
                    if (SecurityContextHolder.getContext().getAuthentication() == null) {
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (JWTVerificationException exc){
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Вы не прошли аутентификацию");
                }
            }
        }

        filterChain.doFilter(request, response);
    }

}
