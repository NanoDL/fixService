package ru.ruslan.spring.diplom.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.ruslan.spring.diplom.dto.FirmwareDownloadDto;
import ru.ruslan.spring.diplom.dto.FirmwareRequestDto;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.service.FirmwareService;
import ru.ruslan.spring.diplom.service.MyUserService;

import java.util.List;

@RestController
@RequestMapping("/api/firmwares")
public class FirmwareController {

    private final FirmwareService firmwareService;
    private final MyUserService myUserService;

    @Autowired
    public FirmwareController(FirmwareService firmwareService, MyUserService myUserService) {
        this.firmwareService = firmwareService;
        this.myUserService = myUserService;
    }

    @GetMapping
    public List<Firmware> getAllFirmwares(){
        return firmwareService.getAll();
    }

    @GetMapping("/{id}")
    public Firmware getFirmwareById(@PathVariable Long id){
        return firmwareService.findById(id);
    }

    @PostMapping
    public Firmware addNewFirmware(@RequestBody @Valid FirmwareRequestDto dto){
        MyUser user = myUserService.getUserFromContext();
        return firmwareService.addNew(user, dto);
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
