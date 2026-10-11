package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentPatientDto {

    private Long id;
    private String name;
    private String gender;
    private String bloodGroup;
}