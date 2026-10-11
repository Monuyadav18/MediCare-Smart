package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.dto.AdminDashboardResponseDto;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.DoctorRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminDashboardResponseDto getDashboardSummary() {

        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();
        long totalAppointments = appointmentRepository.count();

        long activeQueue =
                appointmentRepository.countByStatusIn(
                        List.of(
                                AppointmentStatus.CHECKED_IN,
                                AppointmentStatus.IN_QUEUE,
                                AppointmentStatus.IN_CONSULTATION
                        )
                );

        return AdminDashboardResponseDto.builder()
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalAppointments(totalAppointments)
                .activeQueue(activeQueue)
                .build();
    }
}