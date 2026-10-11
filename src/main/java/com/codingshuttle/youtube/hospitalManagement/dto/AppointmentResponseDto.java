package com.codingshuttle.youtube.hospitalManagement.dto;

import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponseDto {

    private Long id;

    private LocalDateTime appointmentTime;

    private String reason;

    private AppointmentStatus status;

    private Integer queueNumber;

    private LocalDateTime bookedAt;

    private DoctorResponseDto doctor;

    // Slot information
    private Long slotId;

    private AppointmentPatientDto patient;

}