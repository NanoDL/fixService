package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.ruslan.spring.diplom.dto.ChatMessageDto;

import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.exception.BadRequestException;

import ru.ruslan.spring.diplom.model.ChatMessage;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.model.Order;
import ru.ruslan.spring.diplom.repository.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final MyUserRepository myUserRepository;
    private final CustomerRepository customerRepository;
    private final MasterRepository masterRepository;
    //private final NotificationController notificationController;

    @Autowired
    public ChatService(ChatMessageRepository chatMessageRepository,
                       OrderRepository orderRepository,
                       ModelMapper modelMapper, MyUserRepository myUserRepository, CustomerRepository customerRepository, MasterRepository masterRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.orderRepository = orderRepository;
        this.modelMapper = modelMapper;
        this.myUserRepository = myUserRepository;
        this.customerRepository = customerRepository;
        this.masterRepository = masterRepository;
    }

    /**
     * Получить все сообщения для заказа
     */
    public List<ChatMessageDto> getMessagesByOrderId(MyUser currentUser, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Заказ не найден"));
        
        // Проверяем, что пользователь имеет доступ к заказу
        if (!isUserRelatedToOrder(currentUser, order)) {
            throw new BadRequestException("У вас нет доступа к этому заказу");
        }
        
        // Получаем сообщения
        List<ChatMessage> messages = chatMessageRepository.findByOrderIdOrderByTimestampAsc(orderId);
        
        // Отмечаем сообщения как прочитанные
        markMessagesAsRead(messages, currentUser);
        
        // Преобразуем в DTO
        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Отправить новое сообщение
     */
    @Transactional
    public ChatMessageDto sendMessage(MyUser sender, Long orderId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Сообщение не может быть пустым");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Заказ не найден"));
        
        // Проверяем, что пользователь имеет доступ к заказу
        if (!isUserRelatedToOrder(sender, order)) {
            throw new BadRequestException("У вас нет доступа к этому заказу");
        }
        
        // Создаем и сохраняем сообщение
        ChatMessage message = new ChatMessage(order, sender, content);
        message = chatMessageRepository.save(message);
        
        // Отправляем уведомление получателю
        sendNotificationToRecipient(message);
        
        return convertToDto(message);
    }

    /**
     * Отметить сообщения как прочитанные
     */
    @Transactional
    public void markAsRead(MyUser currentUser, Long orderId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(orderId, currentUser.getId());
        markMessagesAsRead(unreadMessages, currentUser);
    }

    /**
     * Получить количество непрочитанных сообщений для пользователя
     */
    public Long getUnreadMessagesCount(MyUser currentUser, Long orderId) {
        return chatMessageRepository.countUnreadMessages(orderId, currentUser.getId());
    }

    /**
     * Получить список заказов с непрочитанными сообщениями
     */
    public List<Long> getOrdersWithUnreadMessages(MyUser currentUser) {
        List<Order> orders = chatMessageRepository.findOrdersWithUnreadMessages(currentUser.getId());
        return orders.stream().map(Order::getId).collect(Collectors.toList());
    }

    /**
     * Проверить, имеет ли пользователь отношение к заказу
     */
    private boolean isUserRelatedToOrder(MyUser user, Order order) {
        return (order.getCustomer() != null && Objects.equals(order.getCustomer().getMyUser().getId(), user.getId())) ||
               (order.getMaster() != null && Objects.equals(order.getMaster().getMyUser().getId(), user.getId()));
    }

    /**
     * Отметить сообщения как прочитанные
     */
    private void markMessagesAsRead(List<ChatMessage> messages, MyUser currentUser) {
        messages.stream()
                .filter(m -> !Objects.equals(m.getSender().getId(), currentUser.getId()) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    chatMessageRepository.save(m);
                });
    }

    /**
     * Отправить уведомление получателю сообщения
     */
    private void sendNotificationToRecipient(ChatMessage message) {
        Order order = message.getOrder();
        MyUser sender = message.getSender();
        
        // Определяем получателя (если отправитель - заказчик, то получатель - мастер и наоборот)
        Long recipientId;
        if (Objects.equals(order.getCustomer().getMyUser().getId(), sender.getId())) {
            // Если отправитель - заказчик, то получатель - мастер
            recipientId = order.getMaster().getMyUser().getId();
        } else {
            // Если отправитель - мастер, то получатель - заказчик
            recipientId = order.getCustomer().getMyUser().getId();
        }
        
        // В упрощенной версии не отправляем уведомления через NotificationController
        // Уведомления будут доставляться через WebSocket подписки
    }

    /**
     * Преобразовать модель в DTO
     */
    private ChatMessageDto convertToDto(ChatMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setOrderId(message.getOrder().getId());
        dto.setSenderId(message.getSender().getId());
        if (message.getSender().getRole() == UserRole.CUSTOMER) {
            customerRepository.findById(message.getSender().getId())
                    .ifPresent(customer -> dto.setSenderName(customer.getFirstName() + " " + customer.getLastName()));
        } else if (message.getSender().getRole() == UserRole.MASTER) {
            masterRepository.findByMyUser_Id(message.getSender().getId())
                    .ifPresent(master -> dto.setSenderName(master.getName()));
        } else {
            dto.setSenderName(message.getSender().getUsername());
        }
        dto.setSenderRole(message.getSender().getRole().name());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }
}
