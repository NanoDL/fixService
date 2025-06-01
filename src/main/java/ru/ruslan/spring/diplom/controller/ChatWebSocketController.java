package ru.ruslan.spring.diplom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import ru.ruslan.spring.diplom.dto.ChatMessageDto;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.security.MyUserDetails;
import ru.ruslan.spring.diplom.service.ChatService;
import ru.ruslan.spring.diplom.service.MyUserService;

import java.util.HashMap;
import java.util.Map;

/**
 * Контроллер для обработки WebSocket сообщений чата
 */
@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final MyUserService userService;

    @Autowired
    public ChatWebSocketController(ChatService chatService, MyUserService userService) {
        this.userService = userService;
        this.chatService = chatService;
    }

    /**
     * Обработка отправки сообщения через WebSocket
     * 
     * @param orderId ID заказа
     * @param messagePayload Содержимое сообщения
     * @param headerAccessor Заголовки сообщения
     * @param authentication Данные аутентификации пользователя
     * @return Отправленное сообщение
     */
    @MessageMapping("/chat.sendMessage/{orderId}")
    @SendTo("/topic/orders/{orderId}/messages")
    public ChatMessageDto sendMessage(
            @DestinationVariable Long orderId,
            @Payload Map<String, String> messagePayload,
            SimpMessageHeaderAccessor headerAccessor,
            Authentication authentication) {

        // Получаем текущего пользователя из объекта Authentication
        MyUser currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof MyUserDetails) {
            MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
            currentUser = userDetails.getMyUser();
        } else {
            // Если аутентификация не прошла, используем ID пользователя из сообщения
            Long userId = Long.parseLong(messagePayload.get("userId"));
            currentUser = userService.getUserById(userId);
        }

        // Получаем содержимое сообщения
        String content = messagePayload.get("content");

        // Отправляем сообщение через сервис
        return chatService.sendMessage(currentUser, orderId, content);
    }

    /**
     * Обработка отметки сообщений как прочитанных через WebSocket
     *
     * @param orderId ID заказа
     * @param headerAccessor Заголовки сообщения
     * @param authentication Данные аутентификации пользователя
     * @return Информация о прочтении сообщений
     */
    @MessageMapping("/chat.markAsRead/{orderId}")
    @SendTo("/topic/orders/{orderId}/read")
    public Map<String, Object> markAsRead(
            @DestinationVariable Long orderId,
            SimpMessageHeaderAccessor headerAccessor,
            Authentication authentication,
            @Payload(required = false) Map<String, String> payload) {

        // Получаем текущего пользователя из объекта Authentication
        MyUser currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof MyUserDetails) {
            MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
            currentUser = userDetails.getMyUser();
        } else {
            // Если аутентификация не прошла, используем ID пользователя из сообщения
            Long userId = payload != null && payload.containsKey("userId") ?
                    Long.parseLong(payload.get("userId")) :
                    Long.parseLong(headerAccessor.getSessionAttributes().get("userId").toString());
            currentUser = userService.getUserById(userId);
        }

        // Отмечаем сообщения как прочитанные
        chatService.markAsRead(currentUser, orderId);

        // Отправляем информацию о прочтении
        Map<String, Object> readInfo = new HashMap<>();
        readInfo.put("userId", currentUser.getId());
        readInfo.put("orderId", orderId);
        readInfo.put("timestamp", System.currentTimeMillis());

        return readInfo;
    }
}
