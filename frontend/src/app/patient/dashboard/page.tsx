"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "motion/react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import PatientDashboard from "@/components/patient/PatientDashboard";

export default function PatientDashboardPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#f7f9fc]">
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <motion.div
                animate={{
                    marginLeft: collapsed ? 88 : 270,
                }}
                transition={{ duration: 0.25 }}
                className="min-h-screen max-lg:!ml-0"
            >
                <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="font-bold text-slate-950 sm:text-lg">
                            Patient Dashboard
                        </h1>
                        <p className="hidden text-xs text-slate-400 sm:block">
                            Manage your appointments and track your live queue
                        </p>
                    </div>
                </header>

                <PatientDashboard />
            </motion.div>
        </main>
    );
}