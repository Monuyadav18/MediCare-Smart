package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.dto.DoctorProfileResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.UpdateDoctorProfileRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.CreateDoctorRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorDashboardResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.DoctorResponseDto;
import com.codingshuttle.youtube.hospitalManagement.dto.OnboardDoctorRequestDto;

import com.codingshuttle.youtube.hospitalManagement.entity.Doctor;
import com.codingshuttle.youtube.hospitalManagement.entity.User;

import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AuthProviderType;
import com.codingshuttle.youtube.hospitalManagement.entity.type.RoleType;

import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.AppointmentSlotRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.DoctorRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.UserRepository;
import com.codingshuttle.youtube.hospitalManagement.dto.AppointmentResponseDto;

import com.codingshuttle.youtube.hospitalManagement.dto.DoctorResponseDto;
import java.util.List;

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.modelmapper.ModelMapper;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    public List<DoctorResponseDto> searchDoctors(String search) {

        List<Doctor> doctors;

        if (search == null || search.isBlank()) {
            doctors = doctorRepository.findAllByOrderByNameAsc();
        } else {
            doctors = doctorRepository.searchDoctors(search.trim());
        }

        return doctors.stream()
                .map(doctor -> new DoctorResponseDto(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        doctor.getEmail()
                ))
                .toList();
    }


    // =========================================================
    // GET ALL DOCTORS
    // =========================================================

    public List<DoctorResponseDto> getAllDoctors() {

        return doctorRepository
                .findAllByOrderByNameAsc()
                .stream()
                .map(doctor ->
                        modelMapper.map(
                                doctor,
                                DoctorResponseDto.class
                        )
                )
                .toList();
    }


    // =========================================================
    // CREATE NEW DOCTOR
    // =========================================================

    @Transactional
    public DoctorResponseDto createDoctor(
            CreateDoctorRequestDto requestDto
    ) {

        String email = requestDto
                .getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.findByUsername(email).isPresent()) {

            throw new IllegalArgumentException(
                    "A user with this email already exists"
            );
        }


        // Create login account
        User user = User.builder()
                .username(email)
                .password(
                        passwordEncoder.encode(
                                requestDto.getPassword()
                        )
                )
                .providerType(AuthProviderType.EMAIL)
                .roles(
                        new HashSet<>(
                                Set.of(RoleType.DOCTOR)
                        )
                )
                .build();

        user = userRepository.save(user);


        // Create doctor profile
        Doctor doctor = Doctor.builder()
                .name(
                        requestDto
                                .getName()
                                .trim()
                )
                .specialization(
                        requestDto
                                .getSpecialization()
                                .trim()
                )
                .email(email)
                .user(user)
                .build();

        doctor = doctorRepository.save(doctor);


        return modelMapper.map(
                doctor,
                DoctorResponseDto.class
        );
    }


    // =========================================================
    // OLD DOCTOR ONBOARDING
    // Temporary - remove later
    // =========================================================

    @Transactional
    public DoctorResponseDto onBoardNewDoctor(
            OnboardDoctorRequestDto onBoardDoctorRequestDto
    ) {

        User user = userRepository
                .findById(
                        onBoardDoctorRequestDto.getUserId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User not found"
                        )
                );


        if (doctorRepository.existsById(
                onBoardDoctorRequestDto.getUserId()
        )) {

            throw new IllegalArgumentException(
                    "Already a doctor"
            );
        }


        Doctor doctor = Doctor.builder()
                .name(
                        onBoardDoctorRequestDto.getName()
                )
                .specialization(
                        onBoardDoctorRequestDto
                                .getSpecialization()
                )
                .email(user.getUsername())
                .user(user)
                .build();


        user.getRoles().add(RoleType.DOCTOR);


        return modelMapper.map(
                doctorRepository.save(doctor),
                DoctorResponseDto.class
        );
    }


    // =========================================================
    // DOCTOR DASHBOARD
    // =========================================================

    public DoctorDashboardResponseDto getDashboardSummary(
            Long doctorId
    ) {

        // Logged-in doctor's profile
        Doctor doctor = doctorRepository
                .findById(doctorId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Doctor profile not found"
                        )
                );


        // Today's date range
        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime startOfNextDay =
                today
                        .plusDays(1)
                        .atStartOfDay();


        // Today's appointments
        long todayAppointments =
                appointmentRepository
                        .countDoctorAppointmentsForDay(
                                doctorId,
                                startOfDay,
                                startOfNextDay,
                                AppointmentStatus.CANCELLED
                        );


        // Current active queue
        long activeQueue =
                appointmentRepository
                        .countDoctorAppointmentsByStatusIn(
                                doctorId,
                                List.of(
                                        AppointmentStatus.CHECKED_IN,
                                        AppointmentStatus.IN_QUEUE,
                                        AppointmentStatus.IN_CONSULTATION
                                )
                        );


        // Today's appointment slots
        long todaySlots =
                appointmentSlotRepository
                        .countDoctorSlotsForDay(
                                doctorId,
                                startOfDay,
                                startOfNextDay
                        );


        // Dashboard response
        return DoctorDashboardResponseDto
                .builder()
                .doctorId(doctor.getId())
                .name(doctor.getName())
                .specialization(
                        doctor.getSpecialization()
                )
                .email(doctor.getEmail())
                .todayAppointments(
                        todayAppointments
                )
                .activeQueue(activeQueue)
                .todaySlots(todaySlots)
                .build();
    }
        // =========================================================
        // DOCTOR LIVE QUEUE - DATE WISE
        // =========================================================

        @Transactional
        public List<AppointmentResponseDto> getDoctorLiveQueue(
                Long doctorId,
                LocalDate date
    ) {

            Doctor doctor = doctorRepository.findAll()
                    .stream()
                    .filter(d -> d.getUser().getId().equals(doctorId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Doctor profile not found"
                    ));

            LocalDateTime startOfDay = date.atStartOfDay();

            LocalDateTime startOfNextDay = date
                    .plusDays(1)
                    .atStartOfDay();

            List<AppointmentStatus> activeStatuses = List.of(
                    AppointmentStatus.CHECKED_IN,
                    AppointmentStatus.IN_QUEUE,
                    AppointmentStatus.IN_CONSULTATION
            );

            return appointmentRepository.findDoctorLiveQueue(
                            doctorId,
                            startOfDay,
                            startOfNextDay,
                            activeStatuses
                    )
                    .stream()
                    .map(appointment ->
                            modelMapper.map(
                                    appointment,
                                    AppointmentResponseDto.class
                            )
                    )
                    .toList();
        }

    // =========================================================
// GET DOCTOR PROFILE
// =========================================================

    @Transactional
    public DoctorProfileResponseDto getDoctorProfile(Long userId) {

        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor profile not found")
                );

        return mapDoctorProfile(doctor);
    }


// =========================================================
// UPDATE DOCTOR PROFILE
// =========================================================

    @Transactional
    public DoctorProfileResponseDto updateDoctorProfile(
            Long userId,
            UpdateDoctorProfileRequestDto request
    ) {

        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor profile not found")
                );

        doctor.setName(request.getName().trim());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setGender(request.getGender());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setHospitalName(request.getHospitalName());
        doctor.setAddress(request.getAddress());
        doctor.setCity(request.getCity());
        doctor.setState(request.getState());


        Doctor updatedDoctor = doctorRepository.save(doctor);

        return mapDoctorProfile(updatedDoctor);
    }


// =========================================================
// ENTITY TO RESPONSE DTO
// =========================================================

    private DoctorProfileResponseDto mapDoctorProfile(Doctor doctor) {

        return DoctorProfileResponseDto.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .specialization(doctor.getSpecialization())
                .phone(doctor.getPhone())
                .gender(doctor.getGender())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .registrationNumber(doctor.getRegistrationNumber())
                .consultationFee(doctor.getConsultationFee())
                .hospitalName(doctor.getHospitalName())
                .address(doctor.getAddress())
                .city(doctor.getCity())
                .state(doctor.getState())
                .profileImageUrl(doctor.getProfileImageUrl())
                .build();
    }

    }
