
import SideBar from "../components/Sidebar";

import OnlineStatusCard from '../components/OnlineStatusCard';
import Breadcrumbs from "../components/Breadcrumbs";
import OverviewCard from "../components/ui/OverviewCard";
import DashboardCard from "../components/DashboardCard";
import PaymentStudentTable from "../components/PaymentStudentTable";
import Chart from "../components/BarChart";

export default function Home() {


    return (
        <>
            <SideBar>
                <Breadcrumbs title="Home" subTitle="Dshboard" />
                <div className="">

                    <DashboardCard />
                    {/* <Chart /> */}
                    <PaymentStudentTable />
                </div>
            </SideBar >
        </>
    );
}