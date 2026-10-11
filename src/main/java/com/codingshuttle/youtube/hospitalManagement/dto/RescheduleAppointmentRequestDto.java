package com.codingshuttle.youtube.hospitalManagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RescheduleAppointmentRequestDto {

    @NotNull(message = "New slot ID is required")
    @Positive(message = "Slot ID must be positive")
    private Long newSlotId;
}