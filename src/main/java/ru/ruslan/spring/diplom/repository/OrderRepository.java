package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.enums.OrderStatus;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.model.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findOrdersByCustomer(Customer customer);
    List<Order> findOrdersByMaster(Master master);
    Optional<Order> findOrderByIdAndCustomer(Long id, Customer customer);
    Optional<Order> findOrderByIdAndMaster(Long id, Master master);
    List<Order> findByStatus(OrderStatus status);
    Optional<Order> deleteOrderById(Long id);

}
