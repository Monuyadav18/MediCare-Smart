package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateAppointmentRequestDto;
import com.codingshuttle.youtube.hospitalManagement.entity.*;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentSlotRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.DoctorRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdateAppointmentStatusRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.RescheduleAppointmentRequestDto;
import com.codingshuttle.youtube.hospitalManagement.error.ConsultationConflictException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentPatientDto;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorResponseDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;
    private final EntityManager entityManager;

    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponseDto createNewAppointment(
            CreateAppointmentRequestDto requestDto) {

        // 1. Get currently logged-in user
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        // 2. Find patient belonging to logged-in user
        Patient patient = patientRepository.findById(user.getId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Patient profile not found for logged-in user"
                        )
                );

        // 3. Lock slot to prevent overbooking
        AppointmentSlot slot =
                appointmentSlotRepository.findByIdForUpdate(requestDto.getSlotId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Appointment slot not found with ID: "
                                                + requestDto.getSlotId()
                                )
                        );

        // 4. Do not allow booking expired slots
        if (slot.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "Cannot book an appointment for an expired slot"
            );
        }

        // 5. Capacity check
        if (slot.getBookedCount() >= slot.getMaxCapacity()) {
            throw new IllegalStateException(
                    "This appointment slot is full"
            );
        }

        // 6. Prevent same patient from booking same slot twice
        boolean alreadyBooked =
                appointmentRepository.existsBySlotIdAndPatientUserIdAndStatusIn(
                        slot.getId(),
                        patient.getUser().getId(),
                        Set.of(
                                AppointmentStatus.BOOKED,
                                AppointmentStatus.CONFIRMED,
                                AppointmentStatus.CHECKED_IN,
                                AppointmentStatus.IN_QUEUE,
                                AppointmentStatus.IN_CONSULTATION
                        )
                );

        if (alreadyBooked) {
            throw new IllegalStateException(
                    "You already have an active appointment in this slot"
            );
        }

        // 7. Generate permanent queue number
        Integer maxQueueNumber =
                appointmentRepository.findMaxQueueNumberBySlotId(slot.getId());

        int queueNumber =
                (maxQueueNumber == null ? 0 : maxQueueNumber) + 1;

        // 8. Doctor automatically comes from slot
        Doctor doctor = slot.getDoctor();

        // 9. Create appointment
        Appointment appointment = Appointment.builder()
                .slot(slot)
                .patient(patient)
                .doctor(doctor)
                .appointmentTime(slot.getStartTime())
                .reason(requestDto.getReason())
                .status(AppointmentStatus.BOOKED)
                .queueNumber(queueNumber)
                .bookedAt(LocalDateTime.now())
                .build();

        appointment = appointmentRepository.save(appointment);

        // 10. Increase slot capacity count
        slot.setBookedCount(slot.getBookedCount() + 1);

        appointmentSlotRepository.save(slot);

        return mapToResponse(appointment);
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR')")
    public AppointmentResponseDto updateAppointmentStatus(
            Long appointmentId,
            UpdateAppointmentStatusRequestDto requestDto
    ) {

        // 1. Logged-in doctor
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        // Lock doctor row to prevent concurrent consultations
        Doctor lockedDoctor = entityManager.find(
                Doctor.class,
                user.getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (lockedDoctor == null) {
            throw new EntityNotFoundException(
                    "Doctor profile not found for logged-in user"
            );
        }


        // 2. Find appointment
        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        // 3. Verify appointment belongs to this doctor
        if (!appointment.getDoctor().getUser().getId()
                .equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only update your own appointments"
            );
        }

        // 4. Validate status
        AppointmentStatus newStatus = requestDto.getStatus();

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "Appointment status is required"
            );
        }

        AppointmentStatus currentStatus = appointment.getStatus();

        // 5. Allow only valid next transitions
        boolean validTransition = switch (currentStatus) {
            case BOOKED -> newStatus == AppointmentStatus.CONFIRMED
                    || newStatus == AppointmentStatus.CHECKED_IN;

            case CONFIRMED -> newStatus == AppointmentStatus.CHECKED_IN;

            case CHECKED_IN -> newStatus == AppointmentStatus.IN_QUEUE;

            case IN_QUEUE -> newStatus == AppointmentStatus.IN_CONSULTATION;

            case IN_CONSULTATION -> newStatus == AppointmentStatus.COMPLETED;

            default -> false;
        };

        if (!validTransition) {
            throw new IllegalStateException(
                    "Invalid status transition: "
                            + currentStatus + " -> " + newStatus
            );
        }

        // Prevent starting consultation too early
        if (newStatus == AppointmentStatus.IN_CONSULTATION) {

            LocalDateTime appointmentTime =
                    appointment.getAppointmentTime();

            LocalDateTime earliestStartTime =
                    appointmentTime.minusMinutes(15);

            LocalDateTime now = LocalDateTime.now();

            if (now.isBefore(earliestStartTime)) {
                throw new IllegalStateException(
                        "Consultation can start only 15 minutes before the scheduled appointment time"
                );
            }
        }

        // Prevent multiple active consultations for same doctor
        if (newStatus == AppointmentStatus.IN_CONSULTATION) {

            boolean consultationAlreadyRunning =
                    appointmentRepository
                            .existsByDoctorUserIdAndStatusAndIdNot(
                                    user.getId(),
                                    AppointmentStatus.IN_CONSULTATION,
                                    appointmentId
                            );

            if (consultationAlreadyRunning) {
                throw new ConsultationConflictException(
                        "Another patient consultation is already in progress"
                );
            }
        }

        // 6. Validate doctor-side check-in time
        if (newStatus == AppointmentStatus.CHECKED_IN) {

            LocalDateTime now = LocalDateTime.now();

            LocalDateTime earliestCheckIn =
                    appointment.getAppointmentTime().minusMinutes(30);

            if (now.isBefore(earliestCheckIn)) {
                throw new IllegalStateException(
                        "Check-in is allowed only 30 minutes before the appointment time"
                );
            }

            appointment.setCheckInTime(now);
        }

        // 7. Update appointment
        appointment.setStatus(newStatus);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        return mapToResponse(savedAppointment);
    }

    // =========================================================
// PATIENT - SELF CHECK-IN
// =========================================================

    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponseDto checkInMyAppointment(Long appointmentId) {

        // 1. Get logged-in patient
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        // 2. Lock appointment
        Appointment appointment = appointmentRepository
                .findByIdForUpdate(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        // 3. Verify ownership
        if (!appointment.getPatient().getUser().getId()
                .equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only check in to your own appointments"
            );
        }

        // 4. Validate appointment status
        AppointmentStatus status = appointment.getStatus();

        if (status != AppointmentStatus.BOOKED
                && status != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only BOOKED or CONFIRMED appointments can be checked in"
            );
        }

        // 5. Validate patient self check-in time
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime earliestCheckIn =
                appointment.getAppointmentTime().minusMinutes(30);

        // Allow check-in 30 minutes before appointment and anytime later
        if (now.isBefore(earliestCheckIn)) {
            throw new IllegalStateException(
                    "Check-in is allowed only 30 minutes before the appointment time"
            );
        }

        // 6. Update appointment
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setCheckInTime(now);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        return mapToResponse(savedAppointment);
    }

    // =========================================================
// PATIENT - MY APPOINTMENTS
// =========================================================

    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    public List<AppointmentResponseDto> getMyAppointments() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        return appointmentRepository
                .findByPatientUserIdOrderByAppointmentTimeDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponseDto cancelMyAppointment(Long appointmentId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        // 1. Appointment details fetch
        Appointment existingAppointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        // 2. Verify ownership
        if (!existingAppointment.getPatient().getUser().getId()
                .equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only cancel your own appointments"
            );
        }

        // 3. Validate slot
        if (existingAppointment.getSlot() == null) {
            throw new IllegalStateException(
                    "This appointment has no associated slot"
            );
        }

        Long slotId = existingAppointment.getSlot().getId();

        // 4. Lock slot FIRST (same order as booking)
        AppointmentSlot lockedSlot = appointmentSlotRepository
                .findByIdForUpdate(slotId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment slot not found"
                ));

        // 5. Lock appointment AFTER slot
        Appointment appointment = appointmentRepository
                .findByIdForUpdate(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found"
                ));
        entityManager.refresh(appointment, LockModeType.PESSIMISTIC_WRITE);

        // 6. Re-check ownership
        if (!appointment.getPatient().getUser().getId()
                .equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only cancel your own appointments"
            );
        }

        // 7. Check allowed statuses
        AppointmentStatus status = appointment.getStatus();

        if (status != AppointmentStatus.BOOKED
                && status != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only BOOKED or CONFIRMED appointments can be cancelled"
            );
        }

        // 8. Prevent past appointment cancellation
        if (!appointment.getAppointmentTime().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "Past appointments cannot be cancelled"
            );
        }

        // 9. Validate slot capacity
        if (lockedSlot.getBookedCount() <= 0) {
            throw new IllegalStateException(
                    "Invalid slot booking count"
            );
        }

        // 10. Update appointment status
        appointment.setStatus(AppointmentStatus.CANCELLED);

        // 11. Release one seat
        lockedSlot.setBookedCount(lockedSlot.getBookedCount() - 1);

        appointmentRepository.save(appointment);
        appointmentSlotRepository.save(lockedSlot);

        return mapToResponse(appointment);
    }

    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponseDto rescheduleMyAppointment(
            Long appointmentId,
            RescheduleAppointmentRequestDto requestDto
    ) {

        // 1. Get logged-in patient
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        if (requestDto == null || requestDto.getNewSlotId() == null) {
            throw new IllegalArgumentException("New slot ID is required");
        }

        // 2. Find existing appointment
        Appointment existing = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        // 3. Verify ownership
        if (!existing.getPatient().getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only reschedule your own appointments"
            );
        }

        if (existing.getSlot() == null) {
            throw new IllegalStateException(
                    "Appointment has no associated slot"
            );
        }

        Long oldSlotId = existing.getSlot().getId();
        Long newSlotId = requestDto.getNewSlotId();

        if (oldSlotId.equals(newSlotId)) {
            throw new IllegalArgumentException(
                    "Please select a different appointment slot"
            );
        }

        // 4. Lock both slots in ascending ID order
        Long firstSlotId = Math.min(oldSlotId, newSlotId);
        Long secondSlotId = Math.max(oldSlotId, newSlotId);

        AppointmentSlot firstLockedSlot = appointmentSlotRepository
                .findByIdForUpdate(firstSlotId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment slot not found: " + firstSlotId
                ));

        AppointmentSlot secondLockedSlot = appointmentSlotRepository
                .findByIdForUpdate(secondSlotId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment slot not found: " + secondSlotId
                ));

        AppointmentSlot oldSlot = oldSlotId.equals(firstSlotId)
                ? firstLockedSlot : secondLockedSlot;

        AppointmentSlot newSlot = newSlotId.equals(firstSlotId)
                ? firstLockedSlot : secondLockedSlot;

        // 5. Lock appointment and refresh current database state
        Appointment appointment = appointmentRepository
                .findByIdForUpdate(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found"
                ));

        entityManager.refresh(appointment, LockModeType.PESSIMISTIC_WRITE);

        // 6. Revalidate ownership and original slot
        if (!appointment.getPatient().getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only reschedule your own appointments"
            );
        }

        if (appointment.getSlot() == null
                || !appointment.getSlot().getId().equals(oldSlotId)) {
            throw new IllegalStateException(
                    "Appointment slot has changed. Please refresh and try again"
            );
        }

        // 7. Validate appointment status
        AppointmentStatus status = appointment.getStatus();

        if (status != AppointmentStatus.BOOKED
                && status != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only BOOKED or CONFIRMED appointments can be rescheduled"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (!appointment.getAppointmentTime().isAfter(now)) {
            throw new IllegalStateException(
                    "Past appointments cannot be rescheduled"
            );
        }

        if (!newSlot.getStartTime().isAfter(now)) {
            throw new IllegalStateException(
                    "Cannot reschedule to an expired slot"
            );
        }

        // 8. Validate capacity
        if (oldSlot.getBookedCount() <= 0) {
            throw new IllegalStateException(
                    "Invalid original slot booking count"
            );
        }

        if (newSlot.getBookedCount() >= newSlot.getMaxCapacity()) {
            throw new IllegalStateException(
                    "Selected appointment slot is full"
            );
        }

        // 9. Prevent duplicate active booking
        boolean alreadyBooked =
                appointmentRepository.existsBySlotIdAndPatientUserIdAndStatusIn(
                        newSlot.getId(),
                        user.getId(),
                        Set.of(
                                AppointmentStatus.BOOKED,
                                AppointmentStatus.CONFIRMED,
                                AppointmentStatus.CHECKED_IN,
                                AppointmentStatus.IN_QUEUE,
                                AppointmentStatus.IN_CONSULTATION
                        )
                );

        if (alreadyBooked) {
            throw new IllegalStateException(
                    "You already have an active appointment in this slot"
            );
        }

        // 10. Generate queue number in new slot
        Integer maxQueueNumber =
                appointmentRepository.findMaxQueueNumberBySlotId(newSlot.getId());

        int newQueueNumber =
                (maxQueueNumber == null ? 0 : maxQueueNumber) + 1;

        // 11. Transfer capacity
        oldSlot.setBookedCount(oldSlot.getBookedCount() - 1);
        newSlot.setBookedCount(newSlot.getBookedCount() + 1);

        // 12. Update existing appointment
        appointment.setSlot(newSlot);
        appointment.setDoctor(newSlot.getDoctor());
        appointment.setAppointmentTime(newSlot.getStartTime());
        appointment.setQueueNumber(newQueueNumber);

        // Reset to BOOKED for the new appointment slot
        appointment.setStatus(AppointmentStatus.BOOKED);

        // 13. Save changes
        appointmentSlotRepository.save(oldSlot);
        appointmentSlotRepository.save(newSlot);

        Appointment updatedAppointment =
                appointmentRepository.save(appointment);

        return mapToResponse(updatedAppointment);
    }

    @Transactional
    @PreAuthorize(
            "hasAuthority('appointment:write') or " +
                    "#doctorId == authentication.principal.id"
    )
    public Appointment reAssignAppointmentToAnotherDoctor(
            Long appointmentId,
            Long doctorId) {

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Appointment not found with ID: "
                                                + appointmentId
                                )
                        );

        Doctor doctor =
                doctorRepository.findById(doctorId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Doctor not found with ID: "
                                                + doctorId
                                )
                        );

        appointment.setDoctor(doctor);

        doctor.getAppointments().add(appointment);

        return appointment;
    }

    @Transactional
    @PreAuthorize(
            "hasRole('ADMIN') OR " +
                    "(hasRole('DOCTOR') AND #doctorId == authentication.principal.id)"
    )
    public List<AppointmentResponseDto> getAllAppointmentsOfDoctor(
            Long doctorId) {

        if (!doctorRepository.existsById(doctorId)) {
            throw new EntityNotFoundException(
                    "Doctor not found with ID: " + doctorId
            );
        }

        return appointmentRepository
                .findByDoctorUserIdOrderByAppointmentTimeDesc(doctorId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AppointmentResponseDto mapToResponse(
            Appointment appointment
    ) {

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        AppointmentPatientDto patientDto =
                AppointmentPatientDto.builder()
                        .id(patient.getId())
                        .name(patient.getName())
                        .gender(
                                patient.getGender() != null
                                        ? patient.getGender().toString()
                                        : null
                        )
                        .bloodGroup(
                                patient.getBloodGroup() != null
                                        ? patient.getBloodGroup().toString()
                                        : null
                        )
                        .build();

        DoctorResponseDto doctorDto =
                modelMapper.map(
                        doctor,
                        DoctorResponseDto.class
                );

        AppointmentResponseDto response =
                new AppointmentResponseDto();

        response.setId(appointment.getId());
        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );
        response.setReason(appointment.getReason());
        response.setStatus(appointment.getStatus());
        response.setQueueNumber(
                appointment.getQueueNumber()
        );
        response.setBookedAt(
                appointment.getBookedAt()
        );

        response.setPatient(patientDto);
        response.setDoctor(doctorDto);

        if (appointment.getSlot() != null) {
            response.setSlotId(
                    appointment.getSlot().getId()
            );
        }

        return response;
    }
}