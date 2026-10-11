package com.codingshuttle.youtube.hospitalManagement.controller;

import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateAppointmentRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.PatientResponseDto;
import com.codingshuttle.youtube.hospitalManagement.service.AppointmentService;
import com.codingshuttle.youtube.hospitalManagement.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.codingshuttle.youtube.hospitalManagement.entity.User;
import org.springframework.security.core.Authentication;
import java.util.List;

import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentSlotResponseDto;
import com.codingshuttle.youtube.hospitalManagement.service.AppointmentSlotService;
import java.time.LocalDate;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorResponseDto;
import com.codingshuttle.youtube.hospitalManagement.service.DoctorService;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdatePatientProfileRequestDto;
import jakarta.validation.Valid;
import com.codingshuttle.youtube.hospitalManagement.dto.RescheduleAppointmentRequestDto;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final AppointmentSlotService appointmentSlotService;
    private final DoctorService doctorService;


    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDto> createNewAppointment(@RequestBody CreateAppointmentRequestDto createAppointmentRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createNewAppointment(createAppointmentRequestDto));
    }

    // =========================================================
// PATIENT - VIEW MY APPOINTMENTS
// =========================================================

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getMyAppointments() {

        return ResponseEntity.ok(
                appointmentService.getMyAppointments()
        );
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientResponseDto> getPatientProfile(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                patientService.getPatientById(user.getId())
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientResponseDto> updatePatientProfile(
            Authentication authentication,
            @Valid @RequestBody UpdatePatientProfileRequestDto request
    ) {

        User user = (User) authentication.getPrincipal();

        PatientResponseDto updatedProfile =
                patientService.updatePatientProfile(
                        user.getId(),
                        request
                );

        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/doctors/{doctorId}/slots")
    public ResponseEntity<List<AppointmentSlotResponseDto>> getDoctorSlots(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(
                appointmentSlotService.getDoctorSlots(doctorId, date)
        );
    }

    @GetMapping("/doctors/search")
    public ResponseEntity<List<DoctorResponseDto>> searchDoctors(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(
                doctorService.searchDoctors(search)
        );
    }

    @PatchMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelMyAppointment(
            @PathVariable Long appointmentId
    ) {
        return ResponseEntity.ok(
                appointmentService.cancelMyAppointment(appointmentId)
        );
    }

    // =========================================================
// PATIENT - SELF CHECK-IN
// =========================================================

    @PatchMapping("/appointments/{appointmentId}/check-in")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDto> checkInAppointment(
            @PathVariable Long appointmentId) {

        AppointmentResponseDto response =
                appointmentService.checkInMyAppointment(appointmentId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/appointments/{appointmentId}/reschedule")
    public ResponseEntity<AppointmentResponseDto> rescheduleMyAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequestDto requestDto
    ) {
        return ResponseEntity.ok(
                appointmentService.rescheduleMyAppointment(
                        appointmentId,
                        requestDto
                )
        );
    }

}
