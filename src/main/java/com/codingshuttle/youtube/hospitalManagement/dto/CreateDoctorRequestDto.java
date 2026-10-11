package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDoctorRequestDto {

    private String name;

    private String email;

    private String password;

    private String specialization;
}