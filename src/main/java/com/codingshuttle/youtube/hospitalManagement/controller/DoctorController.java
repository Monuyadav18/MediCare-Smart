
package com.codingshuttle.youtube.hospitalManagement.controller;

import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentSlotResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateDoctorAvailabilityRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorDashboardResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdateAppointmentStatusRequestDto;

import com.codingshuttle.youtube.hospitalManagement.entity.User;

import com.codingshuttle.youtube.hospitalManagement.service.AppointmentService;
import com.codingshuttle.youtube.hospitalManagement.service.AppointmentSlotService;
import com.codingshuttle.youtube.hospitalManagement.service.DoctorService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.codingshuttle.youtube.hospitalManagement.dto.DoctorProfileResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdateDoctorProfileRequestDto;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import com.codingshuttle.youtube.hospitalManagement.service.DoctorPhotoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final AppointmentService appointmentService;
    private final AppointmentSlotService appointmentSlotService;
    private final DoctorService doctorService;
    private final DoctorPhotoService doctorPhotoService;


    // =========================================================
    // DOCTOR DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<DoctorDashboardResponseDto> getDashboard() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                doctorService.getDashboardSummary(
                        user.getId()
                )
        );
    }


    // =========================================================
    // GET DOCTOR APPOINTMENTS
    // =========================================================

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>>
    getAllAppointmentsOfDoctor() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                appointmentService
                        .getAllAppointmentsOfDoctor(
                                user.getId()
                        )
        );
    }

    // =========================================================
// GET DOCTOR LIVE QUEUE - DATE WISE
// =========================================================

    @GetMapping("/queue")
    public ResponseEntity<List<AppointmentResponseDto>>
    getDoctorLiveQueue(
            @RequestParam LocalDate date
    ) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                doctorService.getDoctorLiveQueue(
                        user.getId(),
                        date
                )
        );
    }


    // =========================================================
    // UPDATE APPOINTMENT STATUS (NEW API)
    // =========================================================

    @PatchMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<AppointmentResponseDto>
    updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody UpdateAppointmentStatusRequestDto request
    ) {

        AppointmentResponseDto response =
                appointmentService.updateAppointmentStatus(
                        appointmentId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET DOCTOR AVAILABILITY
    // =========================================================

    @GetMapping("/availability")
    public ResponseEntity<List<AppointmentSlotResponseDto>>
    getAvailability(
            @RequestParam LocalDate date
    ) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                appointmentSlotService.getDoctorSlots(
                        user.getId(),
                        date
                )
        );
    }


    // =========================================================
    // CREATE DOCTOR AVAILABILITY
    // =========================================================

    @PostMapping("/availability")
    public ResponseEntity<List<AppointmentSlotResponseDto>>
    createAvailability(
            @RequestBody CreateDoctorAvailabilityRequestDto request
    ) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                appointmentSlotService.createSlots(
                        user.getId(),
                        request
                )
        );
    }

    // =========================================================
// GET LOGGED-IN DOCTOR PROFILE
// =========================================================

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/profile")
    public ResponseEntity<DoctorProfileResponseDto> getDoctorProfile() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                doctorService.getDoctorProfile(user.getId())
        );
    }


// =========================================================
// UPDATE LOGGED-IN DOCTOR PROFILE
// =========================================================

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/profile")
    public ResponseEntity<DoctorProfileResponseDto> updateDoctorProfile(
            @Valid @RequestBody UpdateDoctorProfileRequestDto request
    ) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok(
                doctorService.updateDoctorProfile(user.getId(), request)
        );
    }

    // =========================================================
// UPLOAD DOCTOR PROFILE PHOTO
// =========================================================

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping(
            value = "/profile/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file
    ) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        String photoUrl = doctorPhotoService.uploadPhoto(
                user.getId(), file
        );

        return ResponseEntity.ok(Map.of(
                "message", "Profile photo uploaded successfully",
                "profileImageUrl", photoUrl
        ));
    }


// =========================================================
// GET DOCTOR PROFILE PHOTO
// =========================================================

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/profile/photo/{filename}")
    public ResponseEntity<byte[]> getProfilePhoto(
            @PathVariable String filename
    ) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        byte[] image = doctorPhotoService.getPhoto(
                user.getId(), filename
        );

        MediaType mediaType;

        if (filename.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(image);
    }

    // =========================================================
// GET DOCTOR PHOTO BY ID
// DOCTOR / ADMIN / PATIENT
// =========================================================

    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    @GetMapping("/{doctorId}/photo")
    public ResponseEntity<byte[]> getDoctorPhotoById(
            @PathVariable Long doctorId
    ) {
        byte[] image = doctorPhotoService.getDoctorPhotoById(doctorId);

        String photoUrl = doctorService
                .getDoctorProfile(doctorId)
                .getProfileImageUrl();

        MediaType mediaType;

        if (photoUrl.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (photoUrl.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .body(image);
    }


// =========================================================
// DELETE DOCTOR PROFILE PHOTO
// =========================================================

    @PreAuthorize("hasRole('DOCTOR')")
    @DeleteMapping("/profile/photo")
    public ResponseEntity<Void> deleteProfilePhoto() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        doctorPhotoService.deletePhoto(user.getId());

        return ResponseEntity.noContent().build();
    }
}
