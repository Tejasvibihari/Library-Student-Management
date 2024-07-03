import { useEffect, useState } from 'react'
import SideBar from '../components/Sidebar'
import StudentDetailCard from '../components/StudentDetailCard'
import client from '../services/axiosClient'
import { useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'

export default function StudentDetail() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [allStudent, setAllStudent] = useState([])
    const [sid, setSid] = useState('');
    const [studentName, setStudentName] = useState('')
    const [active, setActive] = useState(false)
    const [pending, setPending] = useState(false)
    const [deactive, setDeactive] = useState(false)


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
    const handleFilter = async () => {
        try {
            const response = await client.get("/api/student/getallstudent", {
                params: {
                    admin: adminId,
                    sid: sid,
                    name: studentName,
                    status: active ? "Active" : deactive ? "Deactive" : pending ? "Pending" : null,
                }
            })
            console.log(response)
            setAllStudent(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <SideBar>
                <Breadcrumbs title="Student Details" subTitle="Student" />
                <div className='grid grid-cols-6 gap-4 mt-5 border p-4 shadow-md'>
                    <div className='col-span-2'>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                        <input onChange={(e) => setSid(e.target.value)} value={sid} type="text" id="studentId" name="studentId" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className='col-span-2'>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input onChange={(e) => setStudentName(e.target.value)} value={studentName} type="text" id="studentName" name="studentName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <fieldset className="col-span-2 flex justify-evenly items-center">
                        <legend className="text-sm font-medium text-gray-700">Status</legend>
                        <div className="flex space-x-2">
                            <div className="flex items-center">
                                <input id="active" name="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                            <div className="flex items-center">
                                <input id="deactive" name="deactive" type="checkbox" checked={deactive} onChange={(e) => setDeactive(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <label htmlFor="deactive" className="ml-2 block text-sm text-gray-900">Deactive</label>
                            </div>
                            <div className="flex items-center">
                                <input id="pending" name="pending" type="checkbox" checked={pending} onChange={(e) => setPending(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <label htmlFor="pending" className="ml-2 block text-sm text-gray-900">Pending</label>
                            </div>
                        </div>
                        <button
                            onClick={handleFilter}
                            className='px-5 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50'>
                            Search
                        </button>
                    </fieldset>
                </div>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-1 mt-10'>
                    {allStudent ? allStudent.map((student, i) => {
                        return <StudentDetailCard
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
