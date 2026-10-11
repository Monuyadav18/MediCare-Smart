
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "motion/react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DoctorProfile from "@/components/doctor/DoctorProfile";

export default function DoctorProfilePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <main className="min-h-screen bg-slate-50">
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <motion.div
                animate={{ marginLeft: collapsed ? 88 : 270 }}
                transition={{ duration: 0.25 }}
                className="min-h-screen max-lg:!ml-0"
            >
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-800 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                Doctor Profile
                            </h1>
                            <p className="text-xs font-medium text-slate-600">
                                MediCare Doctor Portal
                            </p>
                        </div>
                    </div>

                    <span className="hidden rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 sm:inline-flex">
            Doctor Workspace
          </span>
                </header>

                <div className="p-4 sm:p-6 lg:p-8">
                    <DoctorProfile />
                </div>
            </motion.div>
        </main>
    );
}
