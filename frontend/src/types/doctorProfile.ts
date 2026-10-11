export interface DoctorProfile {
    id: number;
    name: string;
    email: string;
    specialization: string | null;
    phone: string | null;
    gender: string | null;
    qualification: string | null;
    experienceYears: number | null;
    registrationNumber: string | null;
    consultationFee: number | null;
    hospitalName: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    profileImageUrl: string | null;
}

export type UpdateDoctorProfile = Pick<
    DoctorProfile,
    | "name"
    | "specialization"
    | "phone"
    | "gender"
    | "qualification"
    | "experienceYears"
    | "consultationFee"
    | "hospitalName"
    | "address"
    | "city"
    | "state"
>;