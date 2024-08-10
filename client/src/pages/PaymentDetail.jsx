import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import SideBar from '../components/Sidebar'
import PaymentDetailTable from '../components/PaymentDetailTable'

export default function PaymentDetail() {
    return (
        <>
            <SideBar>
                <Breadcrumbs title='Payment Detail' subTitle='Payment' />
                <PaymentDetailTable />
            </SideBar>
        </>
    )
}
