package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.DeviceModelRequestDto;
import ru.ruslan.spring.diplom.dto.DeviceModelResponseDto;
import ru.ruslan.spring.diplom.dto.FirmwareResponseInfoDto;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.exception.NotFoundException;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.repository.DeviceModelRepository;
import ru.ruslan.spring.diplom.repository.FirmwareRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new NotFoundException("Device model not found"));
    }

    public List<DeviceModel> fildAll(){
        return deviceModelRepository.findAll();
    }

    public Page<DeviceModelResponseDto> findAllWithFilters(Pageable pageable, DeviceType type, String manufacturer, String search) {
        // Начинаем со "спецификации по умолчанию" (пустая — ничего не фильтрует)
        Specification<DeviceModel> spec = Specification.where(null);

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }

        if (manufacturer != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("manufacturer"), manufacturer));
        }

        if (search != null) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
        }

        Page<DeviceModel> deviceModels = deviceModelRepository.findAll(spec, pageable);
        return deviceModels.map(this::toResponse);
    }
    
    public DeviceModelResponseDto toResponse(DeviceModel deviceModel) {
        DeviceModelResponseDto dto = new DeviceModelResponseDto();
        dto.setId(deviceModel.getId());
        dto.setName(deviceModel.getName());
        dto.setManufacturer(deviceModel.getManufacturer());
        if (deviceModel.getType() != null) {
            dto.setType(deviceModel.getType().toString());
        }
        
        if (deviceModel.getCompatibleFirmwares() != null) {
            List<FirmwareResponseInfoDto> firmwareResponseInfoDtos = deviceModel.getCompatibleFirmwares()
                    .stream()
                    .map(firmware -> {
                        FirmwareResponseInfoDto firmwareDto = new FirmwareResponseInfoDto();
                        firmwareDto.setId(firmware.getId());
                        firmwareDto.setName(firmware.getName());
                        firmwareDto.setVersion(firmware.getVersion());
                        firmwareDto.setManufacturer(firmware.getManufacturer());
                        firmwareDto.setDescription(firmware.getDescription());
                        firmwareDto.setDeviceType(firmware.getDeviceType());
                        firmwareDto.setFileUrl(firmware.getFileUrl());
                        firmwareDto.setUploadDate(firmware.getUploadDate());
                        firmwareDto.setUploadedBy(firmware.getUploadedBy());
                        firmwareDto.setUpdatedBy(firmware.getUpdatedBy());
                        return firmwareDto;
                    })
                    .toList();
            dto.setCompatibleFirmwares(firmwareResponseInfoDtos);
        }
        
        return dto;
    }

    public Set<String> findAllManufacturers() {
        return deviceModelRepository.findAll().stream()
                .map(DeviceModel::getManufacturer)
                .filter(m -> m != null && !m.isEmpty())
                .collect(Collectors.toSet());
    }

    public DeviceModel addNew(DeviceModelRequestDto dto){
        DeviceModel deviceModel = new DeviceModel();
        deviceModel.setName(dto.getName());
        deviceModel.setManufacturer(dto.getManufacturer());
        deviceModel.setType(dto.getType());
        return deviceModelRepository.save(deviceModel);
    }

    public DeviceModel update(Long id, DeviceModelRequestDto dto) {
        DeviceModel deviceModel = findById(id);
        deviceModel.setName(dto.getName());
        deviceModel.setManufacturer(dto.getManufacturer());
        deviceModel.setType(dto.getType());
        return deviceModelRepository.save(deviceModel);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MASTER')")
    public List<Firmware> findFirmwares(Long id){
        DeviceModel deviceModel = findById(id);
        return deviceModel.getCompatibleFirmwares();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MASTER')")
    @Transactional
    public DeviceModel addFirmwareToDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        Firmware firmware = firmwareRepository.findById(firmwareId)
                .orElseThrow(() -> new NotFoundException("Firmware not found"));
        
        firmware.getCompatibleDevices().add(device);
        firmwareRepository.save(firmware);
        
        return device;
    }

    public List<DeviceModel> findOrCreateDevicesByNames(List<String> names, DeviceType type, String manufacturer) {
        // 1. Находим все устройства из списка, которые уже есть
        List<DeviceModel> existingDevices = deviceModelRepository.findAllByNameIn(names).orElse(new ArrayList<>());

        // 2. Извлекаем имена найденных устройств
        Set<String> existingNames = existingDevices.stream()
                .map(DeviceModel::getName)
                .collect(Collectors.toSet());

        // 3. Находим имена, которых нет в БД
        List<String> missingNames = names.stream()
                .filter(name -> !existingNames.contains(name))
                .toList();

        // 4. Создаём новые DeviceModel для недостающих имён, с указанием типа и производителя
        List<DeviceModel> newDevices = missingNames.stream()
                .map(name -> {
                    DeviceModel device = new DeviceModel();
                    device.setName(name);
                    device.setType(type);
                    device.setManufacturer(manufacturer);
                    return device;
                })
                .toList();

        // 5. Сохраняем новые устройства в БД
        List<DeviceModel> savedDevices = deviceModelRepository.saveAll(newDevices);

        // 6. Возвращаем объединённый список (старые + новые)
        List<DeviceModel> allDevices = new ArrayList<>();
        allDevices.addAll(existingDevices);
        allDevices.addAll(savedDevices);

        return allDevices;
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MASTER')")
    @Transactional
    public DeviceModel removeFirmwareFromDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        Firmware firmware = firmwareRepository.findById(firmwareId)
                .orElseThrow(() -> new NotFoundException("Firmware not found"));
        
        firmware.getCompatibleDevices().remove(device);
        firmwareRepository.save(firmware);
        
        return device;
    }
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MASTER')")
    public Firmware getFirmwareFromDevice(Long deviceId, Long firmwareId) {
        DeviceModel device = findById(deviceId);
        return device.getCompatibleFirmwares().stream()
                .filter(firmware -> firmware.getId().equals(firmwareId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Firmware not found for this device"));
    }

    public List<DeviceModel> findAllByManufacturer(String manufacturer) {
        return deviceModelRepository.findAllByManufacturer(manufacturer).orElseThrow(() -> new RuntimeException("Device not found"));
    }

    public List<DeviceModel> findAllByTypeAndManufact(DeviceType type, String manufact) {
        return deviceModelRepository.findAllByTypeAndManufacturer(type, manufact).orElseThrow(() -> new RuntimeException("Devices not found"));
    }

    // Для обратной совместимости, если этот метод вызывается где-то еще
    public List<DeviceModel> findOrCreateDevicesByNames(List<String> names) {
        return findOrCreateDevicesByNames(names, null, null);
    }
}
