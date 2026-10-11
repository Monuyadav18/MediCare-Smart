package com.codingshuttle.youtube.hospitalManagement.service;

import com.codingshuttle.youtube.hospitalManagement.entity.Doctor;
import com.codingshuttle.youtube.hospitalManagement.repository.DoctorRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorPhotoService {

    private final DoctorRepository doctorRepository;

    @Value("${app.upload.doctor-photo-dir}")
    private String uploadDirectory;

    public String uploadPhoto(Long userId, MultipartFile file) {

        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor profile not found"
                ));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select an image"
            );
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Maximum image size is 2 MB"
            );
        }

        try {
            byte[] header = new byte[12];

            try (var input = file.getInputStream()) {
                int count = input.read(header);
                if (count < 12) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Invalid image file"
                    );
                }
            }

            String extension;

            boolean jpeg =
                    (header[0] & 0xFF) == 0xFF &&
                            (header[1] & 0xFF) == 0xD8 &&
                            (header[2] & 0xFF) == 0xFF;

            boolean png =
                    (header[0] & 0xFF) == 0x89 &&
                            header[1] == 0x50 &&
                            header[2] == 0x4E &&
                            header[3] == 0x47 &&
                            header[4] == 0x0D &&
                            header[5] == 0x0A &&
                            header[6] == 0x1A &&
                            header[7] == 0x0A;

            boolean webp =
                    new String(header, 0, 4, java.nio.charset.StandardCharsets.US_ASCII)
                            .equals("RIFF") &&
                            new String(header, 8, 4, java.nio.charset.StandardCharsets.US_ASCII)
                                    .equals("WEBP");

            if (jpeg) {
                extension = ".jpg";
            } else if (png) {
                extension = ".png";
            } else if (webp) {
                extension = ".webp";
            } else {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only JPG, PNG and WebP images are allowed"
                );
            }

            Path directory = Path.of(uploadDirectory)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(directory);

            String filename = UUID.randomUUID() + extension;
            Path destination = directory.resolve(filename).normalize();

            if (!destination.startsWith(directory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid file path"
                );
            }

            try (var input = file.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }

            String oldPhotoUrl = doctor.getProfileImageUrl();

            String photoUrl = "/doctors/profile/photo/" + filename;

            try {
                doctor.setProfileImageUrl(photoUrl);
                doctorRepository.save(doctor);
            } catch (RuntimeException exception) {
                Files.deleteIfExists(destination);
                throw exception;
            }

            deleteOldPhoto(oldPhotoUrl, directory);

            return photoUrl;

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save profile photo",
                    exception
            );
        }
    }

    public byte[] getPhoto(Long userId, String filename) {

        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor profile not found"
                ));

        String expectedUrl = "/doctors/profile/photo/" + filename;

        if (!expectedUrl.equals(doctor.getProfileImageUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Photo not found"
            );
        }

        Path directory = Path.of(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        Path photoPath = directory.resolve(filename).normalize();

        if (!photoPath.startsWith(directory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path"
            );
        }

        try {
            return Files.readAllBytes(photoPath);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Photo not found"
            );
        }
    }

    // =========================================================
// GET DOCTOR PHOTO BY DOCTOR ID
// Accessible to authorized Doctor, Admin and Patient
// =========================================================

    public byte[] getDoctorPhotoById(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor profile not found"
                ));

        String photoUrl = doctor.getProfileImageUrl();

        if (photoUrl == null || photoUrl.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Doctor profile photo not found"
            );
        }

        String prefix = "/doctors/profile/photo/";

        if (!photoUrl.startsWith(prefix)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invalid doctor photo reference"
            );
        }

        String filename = photoUrl.substring(prefix.length());

        if (!filename.matches(
                "[a-fA-F0-9-]{36}\\.(jpg|png|webp)"
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid photo filename"
            );
        }

        return getPhoto(doctorId, filename);
    }

    public void deletePhoto(Long userId) {

        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor profile not found"
                ));

        String oldPhotoUrl = doctor.getProfileImageUrl();

        doctor.setProfileImageUrl(null);
        doctorRepository.save(doctor);

        Path directory = Path.of(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        deleteOldPhoto(oldPhotoUrl, directory);
    }

    private void deleteOldPhoto(String photoUrl, Path directory) {

        String prefix = "/doctors/profile/photo/";

        if (photoUrl == null || !photoUrl.startsWith(prefix)) {
            return;
        }

        String filename = photoUrl.substring(prefix.length());

        if (!filename.matches("[a-fA-F0-9-]{36}\\.(jpg|png|webp)")) {
            return;
        }

        Path path = directory.resolve(filename).normalize();

        if (!path.startsWith(directory)) {
            return;
        }

        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // Photo reference has already been updated.
            // Orphaned files can be cleaned up separately.
        }
    }
}