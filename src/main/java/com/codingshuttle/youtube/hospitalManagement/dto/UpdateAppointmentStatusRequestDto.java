package com.codingshuttle.youtube.hospitalManagement.dto;

import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import lombok.Data;

@Data
public class UpdateAppointmentStatusRequestDto {

    private AppointmentStatus status;

}