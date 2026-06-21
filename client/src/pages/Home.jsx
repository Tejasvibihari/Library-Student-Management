
import SideBar from "../components/Sidebar";

import OnlineStatusCard from '../components/OnlineStatusCard';
import Breadcrumbs from "../components/Breadcrumbs";
import OverviewCard from "../components/ui/OverviewCard";
import DashboardCard from "../components/DashboardCard";
import PaymentStudentTable from "../components/PaymentStudentTable";
import Chart from "../components/BarChart";
import { useEffect, useState } from "react";
import client from "../services/axiosClient";
import { useSelector } from "react-redux";
import BarChart from "../components/BarChart";
import { IndianRupee } from 'lucide-react';
import PiChart from "../components/PiChart";

export default function Home() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [Student, setAllStudent] = useState([])

    useEffect(() => {
        const getAllStudent = async () => {
            try {
                const response = await client.get("/api/v2/student/getallstudent", {
                    params: { admin: adminId }
                })
                setAllStudent(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        getAllStudent()


    }, [adminId])
    return (
        <>
            {/* <SideBar> */}
            <Breadcrumbs title="Home" subTitle="Dshboard" />
            <div className=" bg-gray-200">

                <DashboardCard allStudent={Student} />
                {/* <Chart /> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 justify-center items-center">
                    <div>
                        <BarChart />
                    </div>
                    <div>
                        <PiChart />
                    </div>
                </div>
                <div className="p-4">
                    <PaymentStudentTable allStudent={Student} />
                </div>
            </div>
            {/* </SideBar > */}
        </>
    );
}