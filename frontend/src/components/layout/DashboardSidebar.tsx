"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
    CalendarDays,
    CalendarPlus2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    HeartPulse,
    LayoutDashboard,
    LogOut,
    Stethoscope,
    UserRound,
    Users,
    X,
} from "lucide-react";

interface DashboardSidebarProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (value: boolean) => void;
}

type Role = "ADMIN" | "DOCTOR" | "PATIENT";

const adminMenu = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Doctors",
        href: "/admin/doctors",
        icon: Stethoscope,
    },
    {
        name: "Patients",
        href: "/admin/patients",
        icon: Users,
    },
    {
        name: "Appointments",
        href: "/admin/appointments",
        icon: CalendarDays,
    },
];

const doctorMenu = [
    {
        name: "Dashboard",
        href: "/doctor/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Availability",
        href: "/doctor/availability",
        icon: Clock3,
    },
    {
        name: "Appointments",
        href: "/doctor/appointments",
        icon: CalendarDays,
    },
    {
        name: "Profile",
        href: "/doctor/profile",
        icon: UserRound,
    },
];

const patientMenu = [
    {
        name: "Dashboard",
        href: "/patient/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Book Appointment",
        href: "/patient/book-appointment",
        icon: CalendarPlus2,
    },
    {
        name: "Find Doctors",
        href: "/patient/doctors",
        icon: Stethoscope,
    },
    {
        name: "My Appointments",
        href: "/patient/appointments",
        icon: CalendarDays,
    },
    {
        name: "Profile",
        href: "/patient/profile",
        icon: UserRound,
    },
];

export default function DashboardSidebar({
                                             collapsed,
                                             setCollapsed,
                                             mobileOpen,
                                             setMobileOpen,
                                         }: DashboardSidebarProps) {
    const pathname = usePathname();

    // ---------------------------------------------------------
    // Detect role
    // ---------------------------------------------------------

    const getCurrentRole = (): Role => {
        if (pathname.startsWith("/admin")) {
            return "ADMIN";
        }

        if (pathname.startsWith("/doctor")) {
            return "DOCTOR";
        }

        return "PATIENT";
    };

    const role = getCurrentRole();

    // ---------------------------------------------------------
    // Menu according to role
    // ---------------------------------------------------------

    const menuItems =
        role === "ADMIN"
            ? adminMenu
            : role === "DOCTOR"
                ? doctorMenu
                : patientMenu;

    const portalName =
        role === "ADMIN"
            ? "Admin Portal"
            : role === "DOCTOR"
                ? "Doctor Portal"
                : "Patient Portal";

    const sectionName =
        role === "ADMIN"
            ? "Management"
            : role === "DOCTOR"
                ? "Doctor Workspace"
                : "Patient Care";

    // ---------------------------------------------------------
    // Logout
    // ---------------------------------------------------------

    const handleLogout = () => {
        sessionStorage.removeItem("medicare_token");
        sessionStorage.removeItem("medicare_user_id");
        sessionStorage.removeItem("medicare_roles");

        window.location.href = "/login";
    };

    // ---------------------------------------------------------
    // Active link
    // ---------------------------------------------------------

    const isActive = (href: string) => {
        if (pathname === href) {
            return true;
        }

        const dashboardPaths = [
            "/admin/dashboard",
            "/doctor/dashboard",
            "/patient/dashboard",
        ];

        if (dashboardPaths.includes(href)) {
            return false;
        }

        return pathname.startsWith(`${href}/`);
    };

    return (
        <>
            {/* Mobile Overlay */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

            <motion.aside
                animate={{
                    width: collapsed ? 88 : 270,
                }}
                transition={{
                    duration: 0.25,
                }}
                className="
          fixed left-0 top-0 z-50 hidden h-screen
          border-r border-slate-200 bg-white
          lg:flex lg:flex-col
        "
            >
                {/* Logo */}

                <div className="flex h-20 items-center border-b border-slate-100 px-5">
                    <Link
                        href="/"
                        className="flex items-center gap-3 overflow-hidden"
                    >
                        <div className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <HeartPulse className="h-6 w-6 text-white" />
                        </div>

                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="whitespace-nowrap text-xl font-bold text-slate-900">
                                    Medi
                                    <span className="text-blue-600">
                    Care
                  </span>
                                </p>

                                <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                                    {portalName}
                                </p>
                            </motion.div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}

                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                    {!collapsed && (
                        <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            {sectionName}
                        </p>
                    )}

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={
                                    collapsed
                                        ? item.name
                                        : undefined
                                }
                                className={`
                  group relative flex h-12 items-center
                  rounded-xl transition-all duration-300

                  ${
                                    collapsed
                                        ? "justify-center"
                                        : "gap-3 px-3"
                                }

                  ${
                                    active
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                }
                `}
                            >
                                <Icon className="h-5 w-5 min-w-5" />

                                {!collapsed && (
                                    <span className="whitespace-nowrap text-sm font-semibold">
                    {item.name}
                  </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}

                <div className="border-t border-slate-100 p-4">
                    <button
                        onClick={handleLogout}
                        title={
                            collapsed
                                ? "Logout"
                                : undefined
                        }
                        className={`
              flex h-12 w-full items-center rounded-xl
              7 transition-all duration-300
              hover:bg-red-50 hover:text-red-600

              ${
                            collapsed
                                ? "justify-center"
                                : "gap-3 px-3"
                        }
            `}
                    >
                        <LogOut className="h-5 w-5 min-w-5" />

                        {!collapsed && (
                            <span className="text-md  font-semibold">
                Logout
              </span>
                        )}
                    </button>
                </div>

                {/* Collapse Button */}

                <button
                    onClick={() =>
                        setCollapsed(!collapsed)
                    }
                    className="absolute -right-3 top-24 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:text-blue-600"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </motion.aside>

            {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

            <aside
                className={`
          fixed left-0 top-0 z-50 flex h-screen w-[280px]
          flex-col bg-white shadow-2xl transition-transform
          duration-300 lg:hidden

          ${
                    mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
        `}
            >
                {/* Mobile Header */}

                <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <HeartPulse className="h-6 w-6 text-white" />
                        </div>

                        <div>
                            <p className="text-xl font-bold">
                                Medi
                                <span className="text-blue-600">
                  Care
                </span>
                            </p>

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                {portalName}
                            </p>
                        </div>
                    </Link>

                    <button
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Mobile Navigation */}

                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                    <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        {sectionName}
                    </p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active =
                            isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className={`
                  flex h-12 items-center gap-3
                  rounded-xl px-4
                  text-sm font-semibold
                  transition-all

                  ${
                                    active
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                }
                `}
                            >
                                <Icon className="h-5 w-5" />

                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile Logout */}

                <div className="border-t border-slate-500 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-md font-semibold text-slate-900 transition-all hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-8 w-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}