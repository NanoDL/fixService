package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.*;
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


    @GetMapping("/forclient")
    public List<DeviceModelResponseInfoDto> getAllDevicesForClient(){
        return deviceModelService.findAllForClient();
    }

    @GetMapping
    public Page<DeviceModelResponseDto> getAllDevices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) DeviceType type,
            @RequestParam(required = false) String search) {
        System.out.println(manufacturer + " " + type + " " + search );
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<DeviceModelResponseDto> pagez = deviceModelService.findAllWithFilters(pageable, type, manufacturer, search);
        System.out.println(pagez.getContent());
        return pagez;
    }



    @GetMapping("/{id}")
    public DeviceModelResponseDto getDeviceById(@PathVariable @Valid Long id){
        DeviceModel deviceModel = deviceModelService.findById(id);
        return deviceModelService.toResponse(deviceModel);
    }

    @GetMapping("/types")
    public List<DeviceType> getTypes(){
        return List.of(DeviceType.values());
    }
    
    @GetMapping("/manufacturers")
    public Set<String> getManufacturers() {
        return deviceModelService.findAllManufacturers();
    }

    @GetMapping("/manufacturers/{manufacturer}")
    public List<DeviceModelResponseDto> getDeviceByManufact(@PathVariable String manufacturer){
        return deviceModelService.findAllByManufacturer(manufacturer);
    }

    @GetMapping("/type/{type}/manufacturer/{manufact}")
    public List<DeviceModel> getDeviceByTypeAndManufact(@PathVariable DeviceType type,
                                                        @PathVariable String manufact){
        return deviceModelService.findAllByTypeAndManufact(type, manufact);
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
    public List<FirmwareResponseInfoDto> getFirmwaresForDevice(@PathVariable Long id){
        List<Firmware> firmwares = deviceModelService.findFirmwares(id);
        return firmwares.stream()
                .map(firmware -> {
                    FirmwareResponseInfoDto dto = new FirmwareResponseInfoDto();
                    dto.setId(firmware.getId());
                    dto.setName(firmware.getName());
                    dto.setDescription(firmware.getDescription());
                    dto.setVersion(firmware.getVersion());
                    dto.setDeviceType(firmware.getDeviceType());
                    dto.setManufacturer(firmware.getManufacturer());
                    dto.setFileUrl(firmware.getFileUrl());
                    dto.setUploadDate(firmware.getUploadDate());
                    dto.setUploadedBy(firmware.getUploadedBy());
                    dto.setUpdatedBy(firmware.getUpdatedBy());
                    return dto;
                })
                .toList();
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
