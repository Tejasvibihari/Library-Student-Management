import React from 'react'
import SideBar from '../components/Sidebar'
import OnlineStatusCard from '../components/OnlineStatusCard'
import EmailDetail from '../components/EmailDetail'

export default function Email() {
    return (
        <>
            <SideBar>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                    <div className='col-span-3'>
                        <EmailDetail />
                    </div>
                    <div>
                        <OnlineStatusCard />
                    </div>
                </div>

            </SideBar>
        </>
    )
}
