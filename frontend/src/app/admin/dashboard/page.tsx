"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
    Bell,
    Menu,
    Search,
    ShieldCheck,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
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
                transition={{
                    duration: 0.25,
                }}
                className="min-h-screen max-lg:!ml-0"
            >
                {/* Top navbar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="hidden w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 md:flex">
                            <Search className="h-4 w-4 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <div className="md:hidden">
                            <p className="font-bold text-slate-900">
                                Admin Dashboard
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 sm:flex">
                            <ShieldCheck className="h-4 w-4" />
                            Administrator
                        </div>

                        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600">
                            <Bell className="h-5 w-5" />

                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-md">
                                MY
                            </div>

                            <div className="hidden xl:block">
                                <p className="text-sm font-bold text-slate-900">
                                    Monu Yadav
                                </p>

                                <p className="text-xs text-slate-400">
                                    Administrator
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard content */}
                <section className="p-4 sm:p-6 xl:p-8">
                    <AdminDashboard />
                </section>
            </motion.div>
        </main>
    );
}