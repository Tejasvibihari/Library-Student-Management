import Breadcrumbs from "../components/Breadcrumbs";
import PaymentStudentTable from "../components/PaymentStudentTable";
import SideBar from "../components/Sidebar";

export default function MakePayment() {
    return (
        <>
            <SideBar>
                <Breadcrumbs title="Make Payment" subTitle="Student" />
                <PaymentStudentTable />
            </SideBar>
        </>
    )
}
