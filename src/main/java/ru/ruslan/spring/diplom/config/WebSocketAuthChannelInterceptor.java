package ru.ruslan.spring.diplom.config;

import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import ru.ruslan.spring.diplom.security.JWTUtil;
import ru.ruslan.spring.diplom.service.MyUserDetailService;

import java.util.List;

/**
 * Перехватчик для аутентификации WebSocket соединений с использованием JWT токена
 */
@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JWTUtil jwtUtil;
    private final MyUserDetailService userDetailService;

    @Autowired
    public WebSocketAuthChannelInterceptor(JWTUtil jwtUtil, MyUserDetailService userDetailService) {
        this.jwtUtil = jwtUtil;
        this.userDetailService = userDetailService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Извлекаем токен из заголовков
            List<String> authorizationHeaders = accessor.getNativeHeader("Authorization");
            String token = null;
            
            // Проверяем заголовок Authorization
            if (authorizationHeaders != null && !authorizationHeaders.isEmpty()) {
                String authHeader = authorizationHeaders.get(0);
                if (authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            
            // Если токен не найден в заголовках, проверяем параметры запроса
            if (token == null) {
                String tokenParam = accessor.getFirstNativeHeader("token");
                if (tokenParam == null) {
                    // Проверяем параметры в URL
                    String query = accessor.getSessionAttributes() != null ? 
                            (String) accessor.getSessionAttributes().get("query") : null;
                    if (query != null && query.contains("token=")) {
                        token = query.substring(query.indexOf("token=") + 6);
                        if (token.contains("&")) {
                            token = token.substring(0, token.indexOf("&"));
                        }
                    }
                } else {
                    token = tokenParam;
                }
            }
            
            // Если токен найден, аутентифицируем пользователя
            if (token != null && !token.isEmpty()) {
                try {
                    String username = jwtUtil.validateTokenAndRetrieveUsername(token);
                    UserDetails userDetails = userDetailService.loadUserByUsername(username);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    accessor.setUser(authentication);
                } catch (JWTVerificationException e) {
                    // Ошибка аутентификации
                    System.err.println("Ошибка аутентификации WebSocket: " + e.getMessage());
                }
            }
        }
        
        return message;
    }
}
