export type AppointmentStatus =
    | "BOOKED"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "IN_QUEUE"
    | "IN_CONSULTATION"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | "RESCHEDULED";

export interface AppointmentDoctor {
    id: number;
    name: string;
    specialization: string;
    email: string | null;
}

export interface AppointmentPatient {
    id: number;
    name: string;
    gender: string | null;
    bloodGroup: string | null;
}

export interface Appointment {
    id: number;
    appointmentTime: string;
    reason: string | null;
    status: AppointmentStatus;
    queueNumber: number | null;
    bookedAt: string;
    slotId: number | null;
    patient: AppointmentPatient;
    doctor: AppointmentDoctor;
}