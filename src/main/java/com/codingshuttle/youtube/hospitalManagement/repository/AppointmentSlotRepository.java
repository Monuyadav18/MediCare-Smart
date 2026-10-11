package com.codingshuttle.youtube.hospitalManagement.repository;

import com.codingshuttle.youtube.hospitalManagement.entity.AppointmentSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentSlotRepository
        extends JpaRepository<AppointmentSlot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM AppointmentSlot s WHERE s.id = :slotId")
    Optional<AppointmentSlot> findByIdForUpdate(
            @Param("slotId") Long slotId
    );

    List<AppointmentSlot> findByDoctorUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            Long doctorId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
            FROM AppointmentSlot s
            WHERE s.doctor.user.id = :doctorId
            AND s.startTime < :endTime
            AND s.endTime > :startTime
            """)
    boolean existsOverlappingSlot(
            @Param("doctorId") Long doctorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        SELECT COUNT(s)
        FROM AppointmentSlot s
        WHERE s.doctor.user.id = :doctorId
        AND s.startTime >= :startOfDay
        AND s.startTime < :startOfNextDay
        """)
    long countDoctorSlotsForDay(
            @Param("doctorId") Long doctorId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );
}