package ru.ruslan.spring.diplom.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ruslan.spring.diplom.dto.DeviceModelRequestDto;
import ru.ruslan.spring.diplom.dto.DeviceModelResponseDto;
import ru.ruslan.spring.diplom.enums.DeviceType;
import ru.ruslan.spring.diplom.exception.NotFoundException;
import ru.ruslan.spring.diplom.model.DeviceModel;
import ru.ruslan.spring.diplom.model.Firmware;
import ru.ruslan.spring.diplom.repository.DeviceModelRepository;
import ru.ruslan.spring.diplom.repository.FirmwareRepository;

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

    public Page<DeviceModel> findAllWithFilters(Pageable pageable, DeviceType type, String manufacturer, String search) {
        if (type != null && manufacturer != null && search != null) {
            return deviceModelRepository.findByTypeAndManufacturerAndNameContainingIgnoreCase(type, manufacturer, search, pageable);
        } else if (type != null && manufacturer != null) {
            return deviceModelRepository.findByTypeAndManufacturer(type, manufacturer, pageable);
        } else if (type != null && search != null) {
            return deviceModelRepository.findByTypeAndNameContainingIgnoreCase(type, search, pageable);
        } else if (manufacturer != null && search != null) {
            return deviceModelRepository.findByManufacturerAndNameContainingIgnoreCase(manufacturer, search, pageable);
        } else if (type != null) {
            return deviceModelRepository.findByType(type, pageable);
        } else if (manufacturer != null) {
            return deviceModelRepository.findByManufacturer(manufacturer, pageable);
        } else if (search != null) {
            return deviceModelRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            return deviceModelRepository.findAll(pageable);
        }
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
}
