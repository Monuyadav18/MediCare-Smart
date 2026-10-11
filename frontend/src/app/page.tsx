"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

const specialties = [
  "Orthopedics",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "General Physician",
];

const features = [
  {
    icon: Search,
    title: "Find the Right Doctor",
    description:
        "Search doctors by specialization and find the right healthcare professional for your needs.",
  },
  {
    icon: CalendarDays,
    title: "Book Smart Slots",
    description:
        "View doctor availability and book appointments through our capacity-based scheduling system.",
  },
  {
    icon: Clock3,
    title: "Track Your Queue",
    description:
        "Know your appointment queue number and manage your healthcare visit more efficiently.",
  },
];

export default function Home() {
  return (
      <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
        {/* Background decorations */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -right-32 top-60 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight">
                  Medi<span className="text-blue-600">Care</span>
                </p>
                <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Smart Healthcare
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {["Home", "Find Doctors", "Services", "How It Works"].map(
                  (item) => (
                      <a
                          key={item}
                          href={
                            item === "Home"
                                ? "#home"
                                : `#${item.toLowerCase().replaceAll(" ", "-")}`
                          }
                          className="relative text-sm font-medium text-slate-600 transition-colors duration-300 hover:text-blue-600"
                      >
                        {item}
                        <span className="absolute -bottom-2 left-0 h-0.5 w-0 rounded-full bg-blue-600 transition-all duration-300 hover:w-full" />
                      </a>
                  ),
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 sm:block"
              >
                Login
              </Link>

              <Link
                  href="/signup"
                  className="group flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 sm:px-5"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </nav>
        </header>

        {/* HERO */}
        <section
            id="home"
            className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-20"
        >
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              Smarter care. Better experience.
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-[68px]">
              Your health deserves
              <span className="relative block text-blue-600">
              smarter care.
              <span className="absolute -bottom-2 left-0 h-2 w-40 rounded-full bg-cyan-300/60 sm:w-56" />
            </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover specialist doctors, check available appointment slots,
              book consultations and manage your healthcare journey from one
              secure platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/25"
              >
                Book an Appointment
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                  href="#find-doctors"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg"
              >
                <Search className="h-5 w-5" />
                Find a Doctor
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Secure appointments
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Live availability
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Smart queue
              </div>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute -right-5 bottom-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 shadow-2xl shadow-blue-900/15 sm:p-9">
              <div className="absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full border-[30px] border-white/10" />

              <div className="relative">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">Healthcare Dashboard</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      Find care near you
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                    <Stethoscope className="h-7 w-7 text-white" />
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-xl">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-slate-400">
                    Search doctor or specialization...
                  </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-blue-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <Stethoscope className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-semibold text-slate-900">
                        Specialists
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Find the right care
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-semibold text-slate-900">
                        Easy Booking
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose available slots
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50">
                        <MapPin className="h-5 w-5 text-cyan-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Nearby Doctors
                        </p>
                        <p className="text-xs text-slate-500">
                          Discover care around you
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-7 -left-2 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Secure Healthcare
                </p>
                <p className="text-xs text-slate-500">
                  Your data stays protected
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* DOCTOR SEARCH */}
        <section
            id="find-doctors"
            className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"
        >
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Find Healthcare
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                What kind of doctor do you need?
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Doctor or specialization"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <MapPin className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Your location"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <button className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20">
                Search Doctors
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                  <button
                      key={specialty}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {specialty}
                  </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section
            id="services"
            className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
        >
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-12 max-w-2xl text-center"
          >
            <p className="font-semibold text-blue-600">WHY MEDICARE?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Healthcare without the hassle
            </h2>
            <p className="mt-4 text-slate-500">
              From finding a specialist to managing your appointment queue,
              everything is designed to make healthcare simpler.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                  <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.12,
                      }}
                      whileHover={{ y: -8 }}
                      className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-300 group-hover:bg-blue-600">
                      <Icon className="h-7 w-7 text-blue-600 transition-colors duration-300 group-hover:text-white" />
                    </div>

                    <h3 className="text-xl font-bold">{feature.title}</h3>

                    <p className="mt-3 leading-7 text-slate-500">
                      {feature.description}
                    </p>

                    <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </motion.div>
              );
            })}
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
          <div className="grid overflow-hidden rounded-[30px] border border-blue-100 bg-blue-600 sm:grid-cols-3">
            {[
              {
                icon: Stethoscope,
                value: "Specialist",
                label: "Doctor Discovery",
              },
              {
                icon: Users,
                value: "Smart",
                label: "Patient Queue",
              },
              {
                icon: CalendarDays,
                value: "Real-Time",
                label: "Slot Availability",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                  <div
                      key={stat.label}
                      className="flex items-center justify-center gap-4 border-white/10 p-7 text-white sm:border-r sm:last:border-r-0"
                  >
                    <Icon className="h-8 w-8 text-blue-200" />
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-sm text-blue-100">{stat.label}</p>
                    </div>
                  </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-blue-600" />
              <span className="font-bold">
              Medi<span className="text-blue-600">Care</span>
            </span>
            </div>

            <p className="text-sm text-slate-400">
              Smart Hospital & Patient Care Platform
            </p>

            <div className="flex gap-5 text-sm text-slate-500">
              <a href="#" className="transition-colors hover:text-blue-600">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-blue-600">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </footer>
      </main>
  );
}