
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

export default function Home() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [Student, setAllStudent] = useState([])
    useEffect(() => {
        const getAllStudent = async () => {
            try {
                const response = await client.get("/api/student/getallstudent", {
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
            <div className="">

                <DashboardCard allStudent={Student} />
                {/* <Chart /> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <BarChart />
                </div>
                < PaymentStudentTable allStudent={Student} />
            </div>
            {/* </SideBar > */}
        </>
    );
}