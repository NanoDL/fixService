package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.ruslan.spring.diplom.dto.FirmwareDownloadDto;
import ru.ruslan.spring.diplom.dto.FirmwareRequestDto;
import ru.ruslan.spring.diplom.dto.FirmwareResponseDto;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.service.DeviceModelService;
import ru.ruslan.spring.diplom.service.FileStorageService;
import ru.ruslan.spring.diplom.service.FirmwareService;
import ru.ruslan.spring.diplom.service.MyUserService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/firmwares")
public class FirmwareController {

    private final FirmwareService firmwareService;
    private final MyUserService myUserService;
    private final FileStorageService fileStorageService;
    private final DeviceModelService deviceModelService;

    @Autowired
    public FirmwareController(FirmwareService firmwareService, MyUserService myUserService, FileStorageService fileStorageService, DeviceModelService deviceModelService) {
        this.firmwareService = firmwareService;
        this.myUserService = myUserService;
        this.fileStorageService = fileStorageService;
        this.deviceModelService = deviceModelService;
    }

    @GetMapping
    public Page<FirmwareResponseDto> getAllFirmwares(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) DeviceType type,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) DeviceModel device,
            @RequestParam(required = false) String search){
        return firmwareService.findAllWithFilters(PageRequest.of(page, size, Sort.by("name").ascending()), name, type, manufacturer, device, search);
    }

    @GetMapping("/{id}")
    public Firmware getFirmwareById(@PathVariable Long id){
        return firmwareService.findById(id);
    }

    @PostMapping
    public Firmware addNewFirmware(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "version", required = false) String version,
            @RequestParam("deviceType") DeviceType deviceType,
            @RequestParam(value = "manufacturer", required = false) String manufacturer,
            @RequestParam("deviceNames") List<String> deviceNames
    ) throws IOException {
        // Сохраняем файл на диск / в S3 / в БД (как удобно)
        String fileUrl = fileStorageService.save(file); // нужно будет создать fileStorageService

        List<DeviceModel> devices = deviceModelService.findOrCreateDevicesByNames(deviceNames, deviceType, manufacturer);

        FirmwareRequestDto firmware = new FirmwareRequestDto();
        firmware.setName(name);
        firmware.setDescription(description);
        firmware.setVersion(version);
        firmware.setDeviceType(deviceType);
        firmware.setManufacturer(manufacturer);
        firmware.setFileUrl(fileUrl);
        firmware.setCompatibleDevices(devices);

        MyUser user = myUserService.getUserFromContext();
        Firmware saved = firmwareService.addNew(user, firmware);
        return saved;
    }

    @PutMapping("/{id}")
    public Firmware updateFirmwareById(@PathVariable Long id, @RequestBody @Valid FirmwareRequestDto dto){
        MyUser user = myUserService.getUserFromContext();
        return firmwareService.updateById(user, id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteFirmware(@PathVariable Long id){
        firmwareService.deleteById(id);
    }

    @GetMapping("/{id}/download")
    public FirmwareDownloadDto downloadFirmware(@PathVariable Long id){
        return firmwareService.findFirmForDownload(id);
    }

    @PostMapping("/{firmwareId}/devices/{deviceId}")
    public Firmware addDeviceToFirmware(@PathVariable Long firmwareId, @PathVariable Long deviceId) {
        return firmwareService.addDeviceToFirmware(firmwareId, deviceId);
    }

    @DeleteMapping("/{firmwareId}/devices/{deviceId}")
    public Firmware removeDeviceFromFirmware(@PathVariable Long firmwareId, @PathVariable Long deviceId) {
        return firmwareService.removeDeviceFromFirmware(firmwareId, deviceId);
    }

}
