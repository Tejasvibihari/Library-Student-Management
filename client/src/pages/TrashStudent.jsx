import { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import client from "../services/axiosClient";
import StudentDetailCard from "../components/StudentDetailCard";
import CircularLoading from "../components/ui/CircularLoading";


export default function TrashStudent() {
    const [trashStudent, setTrashStudent] = useState()
    const [loading, setLoading] = useState()

    useEffect(() => {
        const getTrashStudent = async () => {
            try {
                setLoading(true)
                const response = await client.get("/api/student/trash-Student")
                console.log(response.data)
                setTrashStudent(response.data)
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        }
        getTrashStudent()
    }, [])

    return (
        <>
            <Breadcrumbs title="Trash Students" subTitle="Student" />

            <div className='grid md:grid-cols-2 grid-cols-1 gap-1 mt-10'>
                {loading ? (
                    <CircularLoading size={30} />
                ) : (
                    trashStudent && trashStudent.length > 0 ? (
                        trashStudent.map((student, i) => (
                            <StudentDetailCard
                                key={i}
                                studentId={student._id}
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
                                shift={student.shift}
                                shiftTo={student.shiftTo}
                                pincode={student.pincode}
                                address={student.address}
                                time={student.time}
                                dist={student.district}
                                block={student.block}
                                src={student.image ? `https://api.biharilibrary.in/uploads/${student.image}` : (student.gender === "Male" ? './img/idDp.jpg' : './img/femaledp.jpg')}                            // src={student.image}
                                status={student.status}
                                lastPayment={student.lastPayment}
                                paymentAmount={student.paymentAmount}
                                nextPayment={student.nextPayment}
                                seatNumber={student.seatNumber}

                            />
                        ))
                    ) : (
                        <p>No students found.</p>
                    )
                )}
            </div>
        </>
    )
}
