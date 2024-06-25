import React, { useEffect, useState } from 'react'
import SideBar from '../components/Sidebar'
import StudentDetailTable from '../components/StudentDetailCard'
import client from '../services/axiosClient'
import { useSelector } from 'react-redux'

export default function StudentDetail() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [allStudent, setAllStudent] = useState([])
    console.log(allStudent.map((student, i) => { student.name })
    )

    useEffect(() => {
        const getAllStudent = async () => {
            try {
                const response = await client.get("/api/student/getallstudent", {
                    params: { admin: adminId }
                })
                setAllStudent(response.data)
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        getAllStudent()
    }, [adminId])
    return (
        <>
            <SideBar>
                <h1>Student Detail</h1>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-1'>
                    {allStudent ? allStudent.map((student, i) => {
                        return <StudentDetailTable
                            key={i}
                            sid={student.sid}
                            name={student.name}
                            email={student.email}
                            mobile={student.mobile}
                            dob={student.dob}
                            aadhar={student.aadhar}
                            father={student.father}
                            guardian={student.guardian}
                            gender={student.gender}
                            preparingFor={student.preparingFor}
                            addmissionDate={student.admissionDate}
                            shiftFrom={student.shiftFrom}
                            shiftTo={student.shiftTo}
                            pincode={student.pincode}
                            village={student.village}
                            dist={student.district}
                            block={student.block}
                            src={student.image}
                            status={student.status}
                            lastPayment={student.lastPayment}

                        />
                    }) : "Nothing Found "}
                </div>
            </SideBar>
        </>
    )
}
