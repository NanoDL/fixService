package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.*;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.model.MyUser;
import ru.ruslan.spring.diplom.repository.DeviceModelRepository;
import ru.ruslan.spring.diplom.repository.FirmwareRepository;

import java.util.List;

import static java.util.stream.Collectors.toList;

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

    public List<Firmware> getAll() {
        return firmwareRepository.findAll();
    }

    public Page<FirmwareResponseDto> findAllWithFilters(Pageable pageable, String name, DeviceType deviceType, String manufacturer, DeviceModel device, String search) {
        // Начинаем со "спецификации по умолчанию" (пустая — ничего не фильтрует)
        Specification<Firmware> spec = Specification.where(null);

        if (name != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("name"), name));
        }

        if (deviceType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("deviceType"), deviceType));
        }

        if (manufacturer != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("manufacturer"), manufacturer));
        }

        if (device != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("compatibleDevices"), device));
        }

        if (search != null) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("name"), "%" + search + "%"));
        }

        Page<Firmware> firmwares = firmwareRepository.findAll(spec, pageable);

        Page<FirmwareResponseDto> newFirmwares = firmwares.map(this::toResponse);
        return newFirmwares;
    }


    private FirmwareResponseDto toResponse(Firmware firmware) {
        List<DeviceModel> deviceModels = firmware.getCompatibleDevices();
        List<DeviceModelResponseInfoDto> newDeviceModels = deviceModels.stream()
                .map(deviceModel ->
                        new DeviceModelResponseInfoDto(deviceModel.getId(), deviceModel.getName(),
                                deviceModel.getManufacturer(),
                                deviceModel.getType())
                )
                .toList();
        FirmwareResponseDto newFirmware = new FirmwareResponseDto(firmware.getId(),
                firmware.getName(),
                firmware.getDescription(),
                firmware.getVersion(),
                firmware.getDeviceType(),
                firmware.getManufacturer(),
                firmware.getFileUrl(),
                newDeviceModels,
                firmware.getUploadDate(),
                firmware.getUploadedBy(),
                firmware.getUpdatedBy());
        return newFirmware;
    }

    public Firmware findById(Long id) {
        return firmwareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Нет такой прошивки!"));
    }

    @Transactional
    public Firmware addNew(MyUser user, FirmwareRequestDto dto) {
        Firmware firmware = modelMapper.map(dto, Firmware.class);
        firmware.setUploadedBy(user);
        return firmwareRepository.save(firmware);
    }

    @Transactional
    public Firmware updateById(MyUser user, Long id, FirmwareRequestDto dto) {
        Firmware firmware = findById(id);
        modelMapper.map(dto, firmware);
        firmware.setUpdatedBy(user);
        return firmwareRepository.save(firmware);
    }

    @Transactional
    public void deleteById(Long id) {
        Firmware firmware = findById(id);
        firmwareRepository.delete(firmware);
    }

    public FirmwareDownloadDto findFirmForDownload(Long id) {
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
