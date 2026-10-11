"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, X } from "lucide-react";
import {
    bookingService,
    type BookingSlot,
} from "@/services/bookingService";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types/appointment";

interface Props {
    appointment: Appointment;
    onClose: () => void;
    onSuccess: () => void;
}

function localDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function RescheduleAppointmentModal({
                                                       appointment,
                                                       onClose,
                                                       onSuccess,
                                                   }: Props) {
    const [date, setDate] = useState(
        localDateString(new Date(appointment.appointmentTime))
    );

    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function fetchSlots() {
            setLoadingSlots(true);
            setSelectedSlot(null);
            setError("");

            try {
                const data = await bookingService.getDoctorSlots(
                    appointment.doctor.id,
                    date
                );

                if (active) setSlots(data);
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load available slots."
                    );
                }
            } finally {
                if (active) setLoadingSlots(false);
            }
        }

        void fetchSlots();

        return () => {
            active = false;
        };
    }, [appointment.doctor.id, date]);

    async function handleReschedule() {
        if (!selectedSlot || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            await appointmentService.rescheduleAppointment(
                appointment.id,
                selectedSlot.id
            );

            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to reschedule appointment."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reschedule-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between gap-3">
                    <h2
                        id="reschedule-title"
                        className="text-xl font-bold text-slate-950"
                    >
                        Reschedule Appointment
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close dialog"
                        className="rounded-lg p-2 text-slate-800 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                    Doctor:{" "}
                    <span className="font-bold text-slate-950">
                        {appointment.doctor.name}
                    </span>
                </p>

                <label
                    htmlFor="reschedule-date"
                    className="mt-6 mb-2 block text-sm font-bold text-slate-900"
                >
                    Select New Date
                </label>

                <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-700" />

                    <input
                        id="reschedule-date"
                        type="date"
                        value={date}
                        min={localDateString(new Date())}
                        onChange={(event) => setDate(event.target.value)}
                        disabled={submitting}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-medium text-slate-950"
                    />
                </div>

                <h3 className="mt-6 text-sm font-bold text-slate-900">
                    Available Time Slots
                </h3>

                {loadingSlots ? (
                    <p className="mt-4 text-sm text-slate-700">
                        Loading available slots...
                    </p>
                ) : slots.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-700">
                        No slots available for this date.
                    </p>
                ) : (
                    <div className="mt-4 grid max-h-56 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                        {slots.map((slot) => {
                            const isCurrentSlot = slot.id === appointment.slotId;
                            const isPast =
                                new Date(slot.startTime).getTime() <= Date.now();

                            const disabled =
                                isCurrentSlot ||
                                isPast ||
                                slot.availableSeats <= 0;

                            return (
                                <button
                                    key={slot.id}
                                    type="button"
                                    disabled={disabled || submitting}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`rounded-xl border p-3 text-center transition ${
                                        selectedSlot?.id === slot.id
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-slate-300 bg-white hover:border-blue-400"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    <Clock3 className="mx-auto mb-2 h-4 w-4 text-blue-700" />

                                    <p className="text-sm font-bold text-slate-950">
                                        {formatTime(slot.startTime)}
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                        {isCurrentSlot
                                            ? "Current Slot"
                                            : `${slot.availableSeats} seats`}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800"
                    >
                        {error}
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => void handleReschedule()}
                        disabled={!selectedSlot || submitting}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Rescheduling..." : "Confirm Reschedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}