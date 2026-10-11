package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.Data;

@Data
public class CreateAppointmentRequestDto {

    private Long slotId;

    private String reason;
}