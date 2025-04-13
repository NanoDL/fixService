package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.DeviceModelRequestDto;
import ru.ruslan.spring.diplom.dto.DeviceModelResponseDto;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.repository.DeviceModelRepository;
import ru.ruslan.spring.diplom.repository.FirmwareRepository;

import java.util.List;

@Service
public class DeviceModelService {
    private final ModelMapper modelMapper;
    private final DeviceModelRepository deviceModelRepository;
    private final FirmwareRepository firmwareRepository;

    @Autowired
    public DeviceModelService(DeviceModelRepository deviceModelRepository, 
                            ModelMapper modelMapper,
                            FirmwareRepository firmwareRepository) {
        this.deviceModelRepository = deviceModelRepository;
        this.modelMapper = modelMapper;
        this.firmwareRepository = firmwareRepository;
    }

    public DeviceModel findById(Long id){
        return deviceModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Такого девайса не существует либо он не добавлен"));
    }

    public List<DeviceModel> fildAll(){
        return deviceModelRepository.findAll();
    }

    public DeviceModel addNew(DeviceModelRequestDto dto){
        DeviceModel deviceModel = modelMapper.map(dto, DeviceModel.class);
        return deviceModelRepository.save(deviceModel);
    }

    public DeviceModel update(Long id, DeviceModelRequestDto dto) {
        DeviceModel existingDevice = findById(id);
        modelMapper.map(dto, existingDevice);
        return deviceModelRepository.save(existingDevice);
    }

    public List<Firmware> findFirmwares(Long id){
        DeviceModel deviceModel = findById(id);
        return deviceModel.getCompatibleFirmwares();
    }

    @Transactional
    public DeviceModel addFirmwareToDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        Firmware firmware = firmwareRepository.findById(firmwareId)
                .orElseThrow(() -> new RuntimeException("Прошивка не найдена"));
        device.getCompatibleFirmwares().add(firmware);
        return deviceModelRepository.save(device);
    }

    @Transactional
    public DeviceModel removeFirmwareFromDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        Firmware firmware = firmwareRepository.findById(firmwareId)
                .orElseThrow(() -> new RuntimeException("Прошивка не найдена"));
        device.getCompatibleFirmwares().remove(firmware);
        return deviceModelRepository.save(device);
    }

    public Firmware getFirmwareFromDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        return device.getCompatibleFirmwares().stream()
                .filter(firmware -> firmware.getId().equals(firmwareId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Прошивка не найдена в списке совместимых для данного устройства"));
    }
}
