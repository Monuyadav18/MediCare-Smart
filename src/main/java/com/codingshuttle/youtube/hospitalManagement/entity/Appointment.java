package com.codingshuttle.youtube.hospitalManagement.entity;

import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Actual slot selected by the patient.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    @ToString.Exclude
    private AppointmentSlot slot;

    /*
     * Keeping this temporarily for compatibility with
     * the existing project. We can remove/migrate it later.
     */
    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    @Column(length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    /*
     * Position inside the booked slot.
     * Example: 1, 2, 3, 4, 5
     */
    private Integer queueNumber;

    @Column(nullable = false)
    private LocalDateTime bookedAt;

    private LocalDateTime checkInTime;
}