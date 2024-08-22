import { LayoutDashboard, UserPlus, User, MailPlus, HandCoins, IndianRupee, Armchair } from "lucide-react";

export const MenuLinkItems = [
    {
        items: [
            {
                id: 1,
                icon: LayoutDashboard,
                name: "Dashboard",
                href: "/",
            },
            {
                id: 2,
                icon: UserPlus,
                name: "Student Admission",
                href: "/admin-student-admission",
            },
            {
                id: 3,
                icon: User,
                name: "Student Detail",
                href: "/student-detail",
            },
            {
                id: 4,
                icon: MailPlus,
                name: "Email",
                href: "/email",
            },
            {
                id: 5,
                icon: HandCoins,
                name: "Make Payment",
                href: "/make-payment",
            },
            {
                id: 6,
                icon: IndianRupee,
                name: "Payment Detail",
                href: "/payment-detail",
            },
            {
                id: 7,
                icon: Armchair,
                name: "Seat",
                href: "/seat",
            },
            {
                id: 7,
                icon: Armchair,
                name: "Update Seat",
                href: "/update-seat",
            },
        ],
    },
];
