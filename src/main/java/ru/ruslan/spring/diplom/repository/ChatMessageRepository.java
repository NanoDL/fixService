package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.ChatMessage;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.model.Order;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Найти все сообщения для конкретного заказа
    List<ChatMessage> findByOrderIdOrderByTimestampAsc(Long orderId);
    
    // Найти все непрочитанные сообщения для пользователя
    @Query("SELECT m FROM ChatMessage m WHERE m.order.id = :orderId AND m.sender.id != :userId AND m.read = false")
    List<ChatMessage> findUnreadMessages(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // Подсчитать количество непрочитанных сообщений для пользователя
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.order.id = :orderId AND m.sender.id != :userId AND m.read = false")
    Long countUnreadMessages(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // Найти все заказы, в которых есть непрочитанные сообщения для пользователя
    @Query("SELECT DISTINCT m.order FROM ChatMessage m WHERE m.sender.id != :userId AND m.read = false AND (m.order.customer.myUser.id = :userId OR m.order.master.myUser.id = :userId)")
    List<Order> findOrdersWithUnreadMessages(@Param("userId") Long userId);
}
