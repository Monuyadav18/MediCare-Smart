package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDashboardResponseDto {

    private Long doctorId;
    private String name;
    private String specialization;
    private String email;

    private long todayAppointments;
    private long activeQueue;
    private long todaySlots;
}