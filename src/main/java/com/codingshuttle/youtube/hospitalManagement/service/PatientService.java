package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.dto.PatientResponseDto;
import com.codingshuttle.youtube.hospitalManagement.entity.Patient;
import com.codingshuttle.youtube.hospitalManagement.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdatePatientProfileRequestDto;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public PatientResponseDto getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new EntityNotFoundException("Patient Not " +
                "Found with id: " + patientId));
        return modelMapper.map(patient, PatientResponseDto.class);
    }

    public List<PatientResponseDto> getAllPatients(Integer pageNumber, Integer pageSize) {
        return patientRepository.findAllPatients(PageRequest.of(pageNumber, pageSize))
                .stream()
                .map(patient -> modelMapper.map(patient, PatientResponseDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientResponseDto updatePatientProfile(
            Long patientId,
            UpdatePatientProfileRequestDto request
    ) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Patient Not Found with id: " + patientId
                        )
                );

        patient.setName(request.getName().trim());
        patient.setGender(request.getGender());
        patient.setBirthDate(request.getBirthDate());
        patient.setBloodGroup(request.getBloodGroup());

        Patient updatedPatient = patientRepository.save(patient);

        return modelMapper.map(updatedPatient, PatientResponseDto.class);
    }
}
