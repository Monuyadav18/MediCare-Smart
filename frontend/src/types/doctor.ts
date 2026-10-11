export interface Doctor {
    id: number;
    name: string;
    specialization: string;
    email: string | null;
}

export interface CreateDoctorRequest {
    name: string;
    email: string;
    password: string;
    specialization: string;
}
export interface DoctorDashboardSummary {
    doctorId: number;
    name: string;
    specialization: string;
    email: string;
    todayAppointments: number;
    activeQueue: number;
    todaySlots: number;
}
export interface CreateDoctorAvailabilityRequest {
    date: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxPatientsPerSlot: number;
}

export interface AppointmentSlot {
    id: number;
    doctorId: number;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    bookedCount: number;
    availableSeats: number;
}