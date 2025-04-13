package ru.ruslan.spring.diplom.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.CreateOrderDto;
import ru.ruslan.spring.diplom.dto.OrderResponseDto;
import ru.ruslan.spring.diplom.enums.OrderStatus;
import ru.ruslan.spring.diplom.enums.UserRole;
import ru.ruslan.spring.diplom.model.*;
import ru.ruslan.spring.diplom.service.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Заказы", description = "API для работы с заказами")
public class OrderController {

    private final OrderService orderService;
    private final CustomerService customerService;
    private final MyUserService myUserService;
    private final MasterService masterService;
    private final DeviceModelService deviceModelService;
    private final ModelMapper modelMapper;

    public OrderController(OrderService orderService,
                           CustomerService customerService,
                           MyUserService myUserService,
                           MasterService masterService, DeviceModelService deviceModelService, ModelMapper modelMapper) {
        this.orderService = orderService;
        this.customerService = customerService;
        this.myUserService = myUserService;
        this.masterService = masterService;
        this.deviceModelService = deviceModelService;
        this.modelMapper = modelMapper;
    }

    @PostMapping
    @Operation(
        summary = "Создать новый заказ",
        description = "Создает новый заказ для текущего пользователя"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Заказ успешно создан"),
        @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания заказа")
    })
    public Order createOrder(@RequestBody CreateOrderDto createOrderDto) {
        MyUser currentUser = myUserService.getUserFromContext();
        DeviceModel deviceModel = null;
        if (currentUser.getRole() != UserRole.CUSTOMER) {
            throw new IllegalArgumentException("Только заказчики могут создавать заказы");
        }

        if (createOrderDto.getDeviceModelId() != null){
            deviceModel = deviceModelService.findById(createOrderDto.getDeviceModelId());
        }

        Customer customer = customerService.findByUserId(currentUser.getId());


        Order order = new Order();
        order.setCustomer(customer);
        order.setRepairType(createOrderDto.getRepairType());
        order.setPrice(createOrderDto.getPrice());
        order.setDescription(createOrderDto.getDescription());
        order.setDevice(deviceModel);
        order.setStatus(OrderStatus.NEW);

        return orderService.createNewOrder(order);
    }

    @PutMapping("/{orderId}/status")
    public OrderResponseDto updateStatus(@PathVariable Long orderId, @RequestBody OrderStatus orderStatus){
        MyUser user = myUserService.getUserFromContext();
        return orderService.updateStatus(user, orderId, orderStatus);
    }

    @PostMapping("/{orderId}/accept")
    @Operation(
        summary = "Принять заказ",
        description = "Мастер принимает заказ на выполнение"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Заказ успешно принят"),
        @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для принятия заказа"),
        @ApiResponse(responseCode = "404", description = "Заказ не найден")
    })
    public Order acceptOrder(@PathVariable Long orderId) {
        MyUser currentUser = myUserService.getUserFromContext();

        if (currentUser.getRole() != UserRole.MASTER) {
            throw new IllegalArgumentException("Только мастера могут принимать заказы");
        }

        Master master = masterService.findByUserId(currentUser.getId());
        Order order = orderService.findById(orderId);

        if (order.getStatus() != OrderStatus.NEW) {
            throw new IllegalArgumentException("Заказ уже принят другим мастером");
        }

        order.setMaster(master);
        order.setStatus(OrderStatus.ACCEPTED);
        return orderService.updateOrder(order);
    }

    @GetMapping
    public List<OrderResponseDto> getNewOrdersForMaster(){
        return orderService.findAvailableOrders();
    }


    @GetMapping("/my")
    @Operation(
        summary = "Получить мои заказы",
        description = "Возвращает список заказов текущего пользователя (заказчика или мастера)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешное получение списка заказов"),
        @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для просмотра заказов")
    })
    public List<OrderResponseDto> getMyOrders() {
        MyUser currentUser = myUserService.getUserFromContext();

        if (currentUser.getRole() == UserRole.CUSTOMER) {
            Customer customer = customerService.findByUserId(currentUser.getId());
            return orderService.findOrdersByCustomer(customer);
        } else if (currentUser.getRole() == UserRole.MASTER) {
            Master master = masterService.findByUserId(currentUser.getId());
            return orderService.findOrdersByMaster(master);
        } else {
            throw new IllegalArgumentException("У вас нет прав для просмотра заказов");
        }
    }

    @GetMapping("/my/{id}")
    public Order getMyOrder(@PathVariable Long id){
        MyUser currentUser = myUserService.getUserFromContext();

        return orderService.findOrderByIdAndUser(currentUser, id);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Удалить заказ",
        description = "Удаляет заказ по ID. Доступно только для владельца заказа"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Заказ успешно удален"),
        @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления заказа"),
        @ApiResponse(responseCode = "404", description = "Заказ не найден")
    })
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id){
        MyUser currentUser = myUserService.getUserFromContext();
        orderService.deleteOrder(currentUser, id);
        return ResponseEntity.noContent().build();
    }
}
