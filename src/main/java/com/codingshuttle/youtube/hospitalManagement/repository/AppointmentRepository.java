package com.codingshuttle.youtube.hospitalManagement.repository;

import com.codingshuttle.youtube.hospitalManagement.entity.Appointment;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    long countByStatusIn(
            Collection<AppointmentStatus> statuses
    );

    // Lock appointment during cancellation
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a WHERE a.id = :appointmentId")
    Optional<Appointment> findByIdForUpdate(
            @Param("appointmentId") Long appointmentId
    );

    boolean existsBySlotIdAndPatientUserIdAndStatusIn(
            Long slotId,
            Long patientId,
            Collection<AppointmentStatus> statuses
    );

    // =========================================================
// DOCTOR LIVE QUEUE - DATE WISE
// =========================================================

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE a.doctor.user.id = :doctorId
        AND a.appointmentTime >= :startOfDay
        AND a.appointmentTime < :startOfNextDay
        AND a.status IN :statuses
        ORDER BY a.appointmentTime ASC,
                 a.queueNumber ASC,
                 a.id ASC
        """)
    List<Appointment> findDoctorLiveQueue(
            @Param("doctorId") Long doctorId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay,
            @Param("statuses") Collection<AppointmentStatus> statuses
    );
    // Logged-in patient ki appointments
    List<Appointment> findByPatientUserIdOrderByAppointmentTimeDesc(
            Long userId
    );

    @Query("""
            SELECT COALESCE(MAX(a.queueNumber), 0)
            FROM Appointment a
            WHERE a.slot.id = :slotId
            """)
    Integer findMaxQueueNumberBySlotId(
            @Param("slotId") Long slotId
    );

    // Doctor ke aaj ke total appointments
    @Query("""
            SELECT COUNT(a)
            FROM Appointment a
            WHERE a.doctor.user.id = :doctorId
            AND a.appointmentTime >= :startOfDay
            AND a.appointmentTime < :startOfNextDay
            AND a.status <> :cancelledStatus
            """)
    long countDoctorAppointmentsForDay(
            @Param("doctorId") Long doctorId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay,
            @Param("cancelledStatus") AppointmentStatus cancelledStatus
    );

    // Current doctor ki active live queue
    @Query("""
            SELECT COUNT(a)
            FROM Appointment a
            WHERE a.doctor.user.id = :doctorId
            AND a.status IN :statuses
            """)
    long countDoctorAppointmentsByStatusIn(
            @Param("doctorId") Long doctorId,
            @Param("statuses") Collection<AppointmentStatus> statuses
    );

    boolean existsByDoctorUserIdAndStatusAndIdNot(
            Long doctorId,
            AppointmentStatus status,
            Long appointmentId
    );
}