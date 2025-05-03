package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.DeviceModelRequestDto;
import ru.ruslan.spring.diplom.dto.DeviceModelResponseDto;
import ru.ruslan.spring.diplom.dto.FirmwareRequestDto;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.service.DeviceModelService;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceModelService deviceModelService;
    @Autowired
    public DeviceController(DeviceModelService deviceModelService) {
        this.deviceModelService = deviceModelService;
    }

    @GetMapping
    public Page<DeviceModel> getAllDevices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) DeviceType type,
            @RequestParam(required = false) String search) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return deviceModelService.findAllWithFilters(pageable, type, manufacturer, search);
    }

    @GetMapping("/{id}")
    public DeviceModel getDeviceById(@PathVariable @Valid Long id){
        return deviceModelService.findById(id);
    }

    @GetMapping("/types")
    public List<DeviceType> getTypes(){
        return List.of(DeviceType.values());
    }
    
    @GetMapping("/manufacturers")
    public Set<String> getManufacturers() {
        return deviceModelService.findAllManufacturers();
    }

    @PostMapping
    public DeviceModel addNewDevice(@RequestBody @Valid DeviceModelRequestDto dto){
        return deviceModelService.addNew(dto);
    }

    @PutMapping("/{id}")
    public DeviceModel updateDevice(@PathVariable Long id, @RequestBody @Valid DeviceModelRequestDto dto){
        return deviceModelService.update(id, dto);
    }

    @GetMapping("/{id}/firmwares")
    public List<Firmware> getFirmwaresForDevice(@PathVariable Long id){
        return deviceModelService.findFirmwares(id);
    }

    @PostMapping("/{deviceId}/firmwares/{firmwareId}")
    public DeviceModel addFirmwareToDevice(@PathVariable Long deviceId, @PathVariable Long firmwareId) {
        return deviceModelService.addFirmwareToDevice(deviceId, firmwareId);
    }

    @DeleteMapping("/{deviceId}/firmwares/{firmwareId}")
    public DeviceModel removeFirmwareFromDevice(@PathVariable Long deviceId, @PathVariable Long firmwareId) {
        return deviceModelService.removeFirmwareFromDevice(deviceId, firmwareId);
    }

    @GetMapping("/{deviceId}/firmwares/{firmwareId}")
    public Firmware getFirmwareFromDevice(@PathVariable Long deviceId, @PathVariable Long firmwareId) {
        return deviceModelService.getFirmwareFromDevice(deviceId, firmwareId);
    }
}
