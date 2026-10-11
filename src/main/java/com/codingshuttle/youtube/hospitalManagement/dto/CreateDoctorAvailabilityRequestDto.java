package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateDoctorAvailabilityRequestDto {

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer slotDurationMinutes;

    private Integer maxPatientsPerSlot;
}