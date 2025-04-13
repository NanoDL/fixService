package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.FirmwareDownloadDto;
import ru.ruslan.spring.diplom.dto.FirmwareRequestDto;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.DeviceModelRepository;
import ru.ruslan.spring.diplom.repository.FirmwareRepository;

import java.util.List;

@Service
public class FirmwareService {
    private final FirmwareRepository firmwareRepository;
    private final DeviceModelRepository deviceModelRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public FirmwareService(FirmwareRepository firmwareRepository, 
                         DeviceModelRepository deviceModelRepository,
                         ModelMapper modelMapper) {
        this.firmwareRepository = firmwareRepository;
        this.deviceModelRepository = deviceModelRepository;
        this.modelMapper = modelMapper;
    }

    public List<Firmware> getAll(){
        return firmwareRepository.findAll();
    }

    public Firmware findById(Long id){
        return firmwareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Нет такой прошивки!"));
    }

    @Transactional
    public Firmware addNew(MyUser user, FirmwareRequestDto dto){
        Firmware firmware = modelMapper.map(dto, Firmware.class);
        firmware.setUploadedBy(user);
        return firmwareRepository.save(firmware);
    }

    @Transactional
    public Firmware updateById(MyUser user, Long id, FirmwareRequestDto dto){
        Firmware firmware = findById(id);
        modelMapper.map(dto, firmware);
        firmware.setUpdatedBy(user);
        return firmwareRepository.save(firmware);
    }

    @Transactional
    public void deleteById(Long id){
        Firmware firmware = findById(id);
        firmwareRepository.delete(firmware);
    }

    public FirmwareDownloadDto findFirmForDownload(Long id){
        Firmware firmware = findById(id);
        return modelMapper.map(firmware, FirmwareDownloadDto.class);
    }

    @Transactional
    public Firmware addDeviceToFirmware(Long firmwareId, Long deviceId) {
        Firmware firmware = findById(firmwareId);
        DeviceModel device = deviceModelRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Устройство не найдено"));
        firmware.getCompatibleDevices().add(device);
        return firmwareRepository.save(firmware);
    }

    @Transactional
    public Firmware removeDeviceFromFirmware(Long firmwareId, Long deviceId) {
        Firmware firmware = findById(firmwareId);
        DeviceModel device = deviceModelRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Устройство не найдено"));
        firmware.getCompatibleDevices().remove(device);
        return firmwareRepository.save(firmware);
    }
}
