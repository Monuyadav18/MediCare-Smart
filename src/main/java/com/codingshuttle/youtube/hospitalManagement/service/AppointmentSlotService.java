package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentSlotResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateDoctorAvailabilityRequestDto;
import com.codingshuttle.youtube.hospitalManagement.entity.AppointmentSlot;
import com.codingshuttle.youtube.hospitalManagement.entity.Doctor;
import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentSlotRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.DoctorRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentSlotService {

    private final AppointmentSlotRepository appointmentSlotRepository;
    private final DoctorRepository doctorRepository;


    // =========================================================
    // CREATE DOCTOR AVAILABILITY
    // =========================================================

    @Transactional
    public List<AppointmentSlotResponseDto> createSlots(
            Long doctorId,
            CreateDoctorAvailabilityRequestDto request
    ) {

        Doctor doctor = doctorRepository
                .findById(doctorId)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Doctor not found with ID: " + doctorId
                        )
                );


        // =====================================================
        // BASIC VALIDATIONS
        // =====================================================

        if (
                request.getDate() == null ||
                        request.getStartTime() == null ||
                        request.getEndTime() == null
        ) {
            throw new IllegalArgumentException(
                    "Date, start time and end time are required"
            );
        }


        if (!request.getEndTime().isAfter(
                request.getStartTime()
        )) {
            throw new IllegalArgumentException(
                    "End time must be after start time"
            );
        }


        if (
                request.getSlotDurationMinutes() == null ||
                        request.getSlotDurationMinutes() <= 0
        ) {
            throw new IllegalArgumentException(
                    "Slot duration must be greater than 0"
            );
        }


        if (
                request.getMaxPatientsPerSlot() == null ||
                        request.getMaxPatientsPerSlot() <= 0
        ) {
            throw new IllegalArgumentException(
                    "Maximum patients per slot must be greater than 0"
            );
        }


        // =====================================================
        // CREATE START / END DATETIME
        // =====================================================

        LocalDateTime availabilityStart =
                LocalDateTime.of(
                        request.getDate(),
                        request.getStartTime()
                );


        LocalDateTime availabilityEnd =
                LocalDateTime.of(
                        request.getDate(),
                        request.getEndTime()
                );


        // =====================================================
        // PAST DATE VALIDATION
        // =====================================================

        if (availabilityStart.isBefore(
                LocalDateTime.now()
        )) {
            throw new IllegalArgumentException(
                    "Cannot create availability in the past"
            );
        }


        List<AppointmentSlotResponseDto> response =
                new ArrayList<>();


        LocalDateTime currentStart =
                availabilityStart;


        // =====================================================
        // GENERATE SLOTS
        // =====================================================

        while (currentStart.isBefore(
                availabilityEnd
        )) {

            LocalDateTime currentEnd =
                    currentStart.plusMinutes(
                            request.getSlotDurationMinutes()
                    );


            // Don't create incomplete final slot

            if (currentEnd.isAfter(
                    availabilityEnd
            )) {
                break;
            }


            // =================================================
            // CHECK OVERLAPPING SLOT
            // =================================================

            boolean overlapping =
                    appointmentSlotRepository
                            .existsOverlappingSlot(
                                    doctorId,
                                    currentStart,
                                    currentEnd
                            );


            if (overlapping) {
                throw new IllegalStateException(
                        "An appointment slot already exists between "
                                + currentStart
                                + " and "
                                + currentEnd
                );
            }


            // =================================================
            // CREATE SLOT
            // =================================================

            AppointmentSlot slot =
                    AppointmentSlot.builder()
                            .doctor(doctor)
                            .startTime(currentStart)
                            .endTime(currentEnd)
                            .maxCapacity(
                                    request.getMaxPatientsPerSlot()
                            )
                            .bookedCount(0)
                            .build();


            slot =
                    appointmentSlotRepository.save(
                            slot
                    );


            response.add(
                    mapToResponse(slot)
            );


            currentStart =
                    currentEnd;
        }


        return response;
    }


    // =========================================================
    // GET DOCTOR AVAILABILITY BY DATE
    // =========================================================

    @Transactional
    public List<AppointmentSlotResponseDto> getDoctorSlots(
            Long doctorId,
            LocalDate date
    ) {

        // =====================================================
        // VALIDATE DATE
        // =====================================================

        if (date == null) {
            throw new IllegalArgumentException(
                    "Date is required"
            );
        }


        // =====================================================
        // VERIFY DOCTOR
        // =====================================================

        if (!doctorRepository.existsById(
                doctorId
        )) {
            throw new EntityNotFoundException(
                    "Doctor not found with ID: "
                            + doctorId
            );
        }


        // =====================================================
        // DATE RANGE
        // =====================================================

        LocalDateTime startOfDay =
                date.atStartOfDay();


        LocalDateTime startOfNextDay =
                date
                        .plusDays(1)
                        .atStartOfDay();


        // =====================================================
        // FETCH SLOTS
        // =====================================================

        return appointmentSlotRepository
                .findByDoctorUserIdAndStartTimeBetweenOrderByStartTimeAsc(
                        doctorId,
                        startOfDay,
                        startOfNextDay
                )
                .stream()
                .filter(slot ->
                        slot.getStartTime().isAfter(LocalDateTime.now())
                )
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // MAP ENTITY -> RESPONSE DTO
    // =========================================================

    private AppointmentSlotResponseDto mapToResponse(
            AppointmentSlot slot
    ) {

        int maxCapacity =
                slot.getMaxCapacity() == null
                        ? 0
                        : slot.getMaxCapacity();


        int bookedCount =
                slot.getBookedCount() == null
                        ? 0
                        : slot.getBookedCount();


        return AppointmentSlotResponseDto
                .builder()
                .id(
                        slot.getId()
                )
                .doctorId(
                        slot
                                .getDoctor()
                                .getUser()
                                .getId()
                )
                .startTime(
                        slot.getStartTime()
                )
                .endTime(
                        slot.getEndTime()
                )
                .maxCapacity(
                        maxCapacity
                )
                .bookedCount(
                        bookedCount
                )
                .availableSeats(
                        Math.max(
                                0,
                                maxCapacity - bookedCount
                        )
                )
                .build();
    }
}