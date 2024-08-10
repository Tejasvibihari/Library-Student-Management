import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import SideBar from '../components/Sidebar'

export default function PaymentDetail() {
    return (
        <>
            <SideBar>
                <Breadcrumbs title='Payment Detail' subTitle='Payment' />
            </SideBar>
        </>
    )
}
