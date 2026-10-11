package com.codingshuttle.youtube.hospitalManagement.dto;

import com.codingshuttle.youtube.hospitalManagement.entity.type.BloodGroupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequestDto {

    @NotBlank(message = "Name is required")
    @Size(max = 40, message = "Name cannot exceed 40 characters")
    private String name;

    private String gender;

    private LocalDate birthDate;

    private BloodGroupType bloodGroup;
}