package ru.ruslan.spring.diplom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.ChatMessageDto;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.service.ChatService;
import ru.ruslan.spring.diplom.service.MyUserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final MyUserService myUserService;

    @Autowired
    public ChatController(ChatService chatService, MyUserService myUserService) {
        this.chatService = chatService;
        this.myUserService = myUserService;
    }

    /**
     * Получить все сообщения для заказа
     */
    @GetMapping("/orders/{orderId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable Long orderId) {
        MyUser currentUser = myUserService.getUserFromContext();
        List<ChatMessageDto> messages = chatService.getMessagesByOrderId(currentUser, orderId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Отправить новое сообщение
     */
    @PostMapping("/orders/{orderId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        MyUser currentUser = myUserService.getUserFromContext();
        String content = payload.get("content");
        ChatMessageDto message = chatService.sendMessage(currentUser, orderId, content);
        return ResponseEntity.ok(message);
    }

    /**
     * Отметить сообщения как прочитанные
     */
    @PatchMapping("/orders/{orderId}/messages/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long orderId) {
        MyUser currentUser = myUserService.getUserFromContext();
        chatService.markAsRead(currentUser, orderId);
        return ResponseEntity.ok().build();
    }

    /**
     * Получить количество непрочитанных сообщений для заказа
     */
    @GetMapping("/orders/{orderId}/messages/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long orderId) {
        MyUser currentUser = myUserService.getUserFromContext();
        Long count = chatService.getUnreadMessagesCount(currentUser, orderId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Получить список заказов с непрочитанными сообщениями
     */
    @GetMapping("/orders/with-unread-messages")
    public ResponseEntity<List<Long>> getOrdersWithUnreadMessages() {
        MyUser currentUser = myUserService.getUserFromContext();
        List<Long> orderIds = chatService.getOrdersWithUnreadMessages(currentUser);
        return ResponseEntity.ok(orderIds);
    }
}
