package com.codingshuttle.youtube.hospitalManagement.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DoctorProfileResponseDto {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String phone;
    private String gender;
    private String qualification;
    private Integer experienceYears;
    private String registrationNumber;
    private BigDecimal consultationFee;
    private String hospitalName;
    private String address;
    private String city;
    private String state;
    private String profileImageUrl;
}