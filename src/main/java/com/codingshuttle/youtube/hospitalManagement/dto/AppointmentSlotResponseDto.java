package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentSlotResponseDto {

    private Long id;

    private Long doctorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer maxCapacity;

    private Integer bookedCount;

    private Integer availableSeats;
}