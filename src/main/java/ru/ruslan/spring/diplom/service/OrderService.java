package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.OrderRequestDto;
import ru.ruslan.spring.diplom.dto.OrderResponseDto;
import ru.ruslan.spring.diplom.enums.OrderStatus;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.exception.BadRequestException;
import ru.ruslan.spring.diplom.model.Customer;
import ru.ruslan.spring.diplom.model.Master;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.model.Order;
import ru.ruslan.spring.diplom.repository.CustomerRepository;
import ru.ruslan.spring.diplom.repository.MasterRepository;
import ru.ruslan.spring.diplom.repository.MyUserRepository;
import ru.ruslan.spring.diplom.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class OrderService {
    private final MyUserRepository myUserRepository;
    private OrderRepository orderRepository;
    private CustomerRepository customerRepository;
    private MasterRepository masterRepository;
    private ModelMapper modelMapper;

    @Autowired
    public OrderService(OrderRepository orderRepository, CustomerRepository customerRepository, MasterRepository masterRepository, ModelMapper modelMapper, MyUserRepository myUserRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.masterRepository = masterRepository;
        this.modelMapper = modelMapper;
        this.myUserRepository = myUserRepository;
    }
    @Transactional
    public Order createNewOrder(Order order) {
        return orderRepository.save(order);
    }
    @Transactional
    public Order updateOrder(Long id, OrderRequestDto dto) {
        Order order = findById(id);
        order.setRepairType(dto.getRepairType());
        order.setPrice(dto.getPrice());
        order.setDescription(dto.getDescription());
        return orderRepository.save(order);
    }

    @Transactional
    public OrderResponseDto acceptOrder(MyUser user, Long id){
        Order order = findById(id);
        Master master = masterRepository.findByMyUser(user).orElseThrow(()-> new BadRequestException("Нет такого мастера"));

        if (order.getStatus() != OrderStatus.NEW){
            throw new BadRequestException("Заказ уже принят");

        }
        order.setMaster(master);
        order.setStatus(OrderStatus.ACCEPTED);
        orderRepository.save(order);
        OrderResponseDto orderResponseDto = modelMapper.map(order, OrderResponseDto.class);
        return orderResponseDto;
    }

    @Transactional
    public OrderResponseDto rejectMaster(MyUser user, Long id){

        Order order = findById(id);
        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Заказ не принят");
        }
        if (order.getCustomer().getMyUser().getId() != user.getId()){
            throw new BadRequestException("Нет прав");
        }
        order.setStatus(OrderStatus.NEW);
        order.setMaster(null);
        orderRepository.save(order);
        OrderResponseDto orderResponseDto = modelMapper.map(order, OrderResponseDto.class);
        return orderResponseDto;
    }
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
    }

    public List<OrderResponseDto> findOrdersByCustomer(Customer customer) {
        List<OrderResponseDto> ordersResp = new ArrayList<>();
        List<Order> orders = orderRepository.findOrdersByCustomer(customer);
        for (Order order : orders){
            OrderResponseDto orderResp = new OrderResponseDto();
            orderResp = modelMapper.map(order, OrderResponseDto.class);
            ordersResp.add(orderResp);
        }
        System.out.println(ordersResp);
        return ordersResp;
    }

    public List<OrderResponseDto> findOrdersByMaster(Master master) {
        List<OrderResponseDto> ordersResp = new ArrayList<>();
        List<Order> orders = orderRepository.findOrdersByMaster(master);
        for (Order order : orders){
            OrderResponseDto orderResp = new OrderResponseDto();
            orderResp = modelMapper.map(order, OrderResponseDto.class);
            ordersResp.add(orderResp);
        }

        return ordersResp;
    }

    public List<OrderResponseDto> findAvailableOrders() {
        List<Order> ordersList = orderRepository.findByStatus(OrderStatus.NEW);
        List<OrderResponseDto> newOrderList = new ArrayList<>();
        for (Order order : ordersList){
            newOrderList.add(modelMapper.map(order, OrderResponseDto.class));
        }
        return newOrderList;
    }

    public OrderResponseDto findAvailableOrderById(Long id){
        Order order = findById(id);
        if (order.getStatus().name() != "NEW"){
            throw new RuntimeException("Этот заказ уже не доступен");
        }
        return modelMapper.map(order, OrderResponseDto.class);

    }


    public OrderResponseDto findOrderByIdAndUser(MyUser user, Long id){
        if (user.getRole() == UserRole.CUSTOMER) {

            Customer customer = customerRepository.findByMyUser_Id(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Заказчик не найден"));
            Order order = orderRepository.findOrderByIdAndCustomer(id, customer)
                    .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
            OrderResponseDto orderResponseDto = modelMapper.map(order, OrderResponseDto.class);
            System.out.println(orderResponseDto);
            return orderResponseDto;

        } else if (user.getRole() == UserRole.MASTER) {

            Master master = masterRepository.findByMyUser_Id(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Мастер не найден"));
            Order order = orderRepository.findOrderByIdAndMaster(id, master)
                    .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
            OrderResponseDto orderResponseDto = modelMapper.map(order, OrderResponseDto.class);
            return orderResponseDto;

        } else {
            throw new IllegalArgumentException("У вас нет прав для просмотра заказов");
        }
    }
    @Transactional
    public void deleteOrder(MyUser user, Long id){
        Order order = findById(id);

        if (user.getRole() == UserRole.CUSTOMER){
            Customer customer = customerRepository.findByMyUser_Id(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Заказчик не найден"));

           if (order.getCustomer().getId().longValue() != customer.getId().longValue()){
               throw new RuntimeException("У вас нет прав на удаление!");
           }

           orderRepository.deleteById(id);

        } else if (user.getRole() == UserRole.MASTER){
            Master master = masterRepository.findByMyUser_Id(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Мастер не найден"));

            if (order.getMaster().getId().longValue() != master.getId().longValue()){
                throw new RuntimeException("У вас нет прав на удаление!");
            }

            order.setMaster(null);
            order.setStatus(OrderStatus.NEW);
        } else {
            throw new RuntimeException("У вас нет прав на удаление!");
        }
    }

    @Transactional
    public OrderResponseDto updateStatus(MyUser user, Long id, OrderStatus orderStatus){
        Order order = findById(id);
        if (!Objects.equals(order.getCustomer().getMyUser().getId(), user.getId()) || !Objects.equals(order.getMaster().getMyUser().getId(), user.getId())){
            throw new BadRequestException("Нет прав");
        }
        order.setStatus(orderStatus);

        return modelMapper.map(order, OrderResponseDto.class);
    }

    @Transactional
    public OrderResponseDto completeOrder(MyUser user, Long id){
        Order order = findById(id);
        if (!Objects.equals(order.getMaster().getMyUser().getId(), user.getId())){
            throw new BadRequestException("Нет прав");
        }
        if (order.getStatus() != OrderStatus.IN_PROGRESS){
            throw new BadRequestException("Заказ должен быть в статусе 'В работе' для завершения");
        }
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);
        return modelMapper.map(order, OrderResponseDto.class);
    }
    /**
     * Запуск заказа в работу мастером
     * @param user Пользователь (мастер)
     * @param id ID заказа
     * @return Обновленный заказ
     */
    @Transactional
    public OrderResponseDto startWork(MyUser user, Long id) {
        Order order = findById(id);

        // Проверяем, что заказ в статусе ACCEPTED
        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Заказ должен быть в статусе 'Принят' для запуска в работу");
        }

        // Проверяем, что пользователь является мастером этого заказа
        if (order.getMaster() == null || !Objects.equals(order.getMaster().getMyUser().getId(), user.getId())) {
            throw new BadRequestException("Нет прав для запуска заказа в работу");
        }

        // Меняем статус на IN_PROGRESS
        order.setStatus(OrderStatus.IN_PROGRESS);
        orderRepository.save(order);

        return modelMapper.map(order, OrderResponseDto.class);
    }

    public OrderResponseDto updatePrice(MyUser currentUser, Long id, BigDecimal price) {
        Order order = findById(id);
        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Заказ не принят");
        }
        if (!Objects.equals(order.getCustomer().getMyUser().getId(), currentUser.getId()) && !Objects.equals(order.getMaster().getMyUser().getId(), currentUser.getId())) {
            throw new BadRequestException("Нет прав");
        }
        order.setPrice(price);
        orderRepository.save(order);
        return modelMapper.map(order, OrderResponseDto.class);
    }
}
