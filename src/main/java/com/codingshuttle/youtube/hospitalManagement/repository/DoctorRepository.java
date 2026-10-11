package com.codingshuttle.youtube.hospitalManagement.repository;

import com.codingshuttle.youtube.hospitalManagement.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAllByOrderByNameAsc();

    @Query("""
        SELECT d FROM Doctor d
        WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY d.name ASC
    """)
    List<Doctor> searchDoctors(@Param("search") String search);
}