package com.codingshuttle.youtube.hospitalManagement.error;

import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUsernameNotFoundException(
            UsernameNotFoundException ex) {

        ApiError apiError = new ApiError(
                "Incorrect username or password. Please try again.",
                HttpStatus.UNAUTHORIZED
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(
            AuthenticationException ex) {

        ApiError apiError = new ApiError(
                "Incorrect username or password. Please try again.",
                HttpStatus.UNAUTHORIZED
        );
        return new ResponseEntity<>(
                apiError,
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiError> handleJwtException(JwtException ex) {
        ApiError apiError = new ApiError("Invalid JWT token: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDeniedException(AccessDeniedException ex) {
        ApiError apiError = new ApiError("Access denied: Insufficient permissions", HttpStatus.FORBIDDEN);
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    // =========================================================
// 409 - CONSULTATION CONFLICT
// =========================================================

    @ExceptionHandler(ConsultationConflictException.class)
    public ResponseEntity<ApiError> handleConsultationConflictException(
            ConsultationConflictException ex) {

        ApiError apiError = new ApiError(
                ex.getMessage(),
                HttpStatus.CONFLICT
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.CONFLICT
        );
    }

    // =========================================================
// 400 - BUSINESS VALIDATION ERRORS
// =========================================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalStateException(
            IllegalStateException ex) {

        ApiError apiError = new ApiError(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.BAD_REQUEST
        );
    }


// =========================================================
// 400 - INVALID REQUEST PARAMETERS
// =========================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        ApiError apiError = new ApiError(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.BAD_REQUEST
        );
    }


// =========================================================
// 404 - ENTITY NOT FOUND
// =========================================================

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFoundException(
            jakarta.persistence.EntityNotFoundException ex) {

        ApiError apiError = new ApiError(
                ex.getMessage(),
                HttpStatus.NOT_FOUND
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {

        // Print complete exception stack trace in IntelliJ console
        ex.printStackTrace();

        ApiError apiError = new ApiError(
                "An unexpected error occurred: " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR
        );

        return new ResponseEntity<>(
                apiError,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
