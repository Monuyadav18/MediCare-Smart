package com.codingshuttle.youtube.hospitalManagement.controller;

import com.codingshuttle.youtube.hospitalManagement.dto.AdminDashboardResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateDoctorRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.OnboardDoctorRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.PatientResponseDto;
import com.codingshuttle.youtube.hospitalManagement.service.AdminService;
import com.codingshuttle.youtube.hospitalManagement.service.DoctorService;
import com.codingshuttle.youtube.hospitalManagement.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AdminService adminService;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(value = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(value = "size", defaultValue = "10") Integer pageSize
    ) {
        return ResponseEntity.ok(
                patientService.getAllPatients(pageNumber, pageSize)
        );
    }

    // New doctor account + doctor profile
    @PostMapping("/doctors")
    public ResponseEntity<DoctorResponseDto> createDoctor(
            @RequestBody CreateDoctorRequestDto requestDto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doctorService.createDoctor(requestDto));
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {
        return ResponseEntity.ok(
                doctorService.getAllDoctors()
        );
    }

    // Old onboarding API - temporarily kept
    @PostMapping("/onBoardNewDoctor")
    public ResponseEntity<DoctorResponseDto> onBoardNewDoctor(
            @RequestBody OnboardDoctorRequestDto onboardDoctorRequestDto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doctorService.onBoardNewDoctor(onboardDoctorRequestDto));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponseDto> getDashboardSummary() {
        return ResponseEntity.ok(
                adminService.getDashboardSummary()
        );
    }
}