package com.codingshuttle.youtube.hospitalManagement.dto;

import com.codingshuttle.youtube.hospitalManagement.entity.type.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {

    private String jwt;
    private Long userId;
    private Set<RoleType> roles;
}