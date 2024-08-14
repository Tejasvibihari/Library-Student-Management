import React, { useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import SideBar from '../components/Sidebar'
import PaymentDetailTable from '../components/PaymentDetailTable'
import client from '../services/axiosClient';

export default function PaymentDetail() {
    const [allPaymentData, setAllPaymentData] = useState([]);

    useEffect(() => {
        const getPaymentData = async () => {
            try {
                const res = await client.get('/api/payment/getallpayment')
                console.log(res.data)
                setAllPaymentData(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        getPaymentData()
    }, [])



    return (
        <>
            {/* <SideBar> */}
                <Breadcrumbs title='Payment Detail' subTitle='Payment' />
                <PaymentDetailTable data={allPaymentData} />
            {/* </SideBar> */}
        </>
    )
}
