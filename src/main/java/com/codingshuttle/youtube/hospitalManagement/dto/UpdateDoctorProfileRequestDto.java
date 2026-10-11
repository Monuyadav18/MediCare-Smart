package com.codingshuttle.youtube.hospitalManagement.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateDoctorProfileRequestDto {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String specialization;

    @Size(max = 15)
    @Pattern(regexp = "^$|^[+]?[0-9]{10,15}$")
    private String phone;

    @Size(max = 20)
    private String gender;

    @Size(max = 150)
    private String qualification;

    @Min(0)
    @Max(70)
    private Integer experienceYears;

    @DecimalMin("0.0")
    private BigDecimal consultationFee;

    @Size(max = 150)
    private String hospitalName;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;
}