import { useEffect, useState } from 'react'
import SideBar from '../components/Sidebar'
import StudentDetailCard from '../components/StudentDetailCard'
import client from '../services/axiosClient'
import { useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import CircularLoading from '../components/ui/CircularLoading'
import { UserPlus } from 'lucide-react';

export default function StudentDetail() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [allStudent, setAllStudent] = useState([])
    const [sid, setSid] = useState('');
    const [studentName, setStudentName] = useState('')
    const [seatNumber, setSeatNumber] = useState('')
    const [active, setActive] = useState(false)
    const [pending, setPending] = useState(false)
    const [deactive, setDeactive] = useState(false)

    const [loading, setLoading] = useState(false)


    useEffect(() => {
        const getAllStudent = async () => {
            setLoading(true)
            try {

                const response = await client.get("/api/student/getallstudent")
                setAllStudent(response.data)
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        }
        getAllStudent()
    }, [adminId])
    const handleFilter = async () => {
        setLoading(true)
        try {
            const response = await client.get("/api/student/getallstudent", {
                params: {
                    sid: sid,
                    name: studentName,
                    seatNumber,
                    status: active ? "Active" : pending ? "Pending" : deactive ? "Deactive" : null,
                }
            })
            console.log(response)
            setAllStudent(response.data)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <>
            {/* <SideBar> */}
            <Breadcrumbs title="Student Details" subTitle="Student" />
            <div className='grid grid-cols-1 md:grid-cols-10 gap-4 mt-5 border p-4 shadow-md'>
                <div className='col-span-2'>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input placeholder='Enter Student SID' onChange={(e) => setSid(e.target.value)} value={sid} type="text" id="studentId" name="studentId" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className='col-span-2'>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input placeholder='Enter Student Name' onChange={(e) => setStudentName(e.target.value)} value={studentName} type="text" id="studentName" name="studentName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className='col-span-2'>
                    <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700">Seat Number</label>
                    <input placeholder='Enter Seat Number' onChange={(e) => setSeatNumber(e.target.value)} value={seatNumber} type="text" id="seatNumber" name="seatNumber" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <fieldset className="col-span-2 flex justify-start items-center">
                    <legend className="text-sm font-medium text-gray-700">Status</legend>
                    <div className="flex space-x-2">
                        <div className="flex items-center">
                            <input id="active" name="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active</label>
                        </div>
                        <div className="flex items-center">
                            <input id="pending" name="pending" type="checkbox" checked={pending} onChange={(e) => setPending(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label htmlFor="pending" className="ml-2 block text-sm text-gray-900">Pending</label>
                        </div>
                        <div className="flex items-center">
                            <input id="deactive" name="deactive" type="checkbox" checked={deactive} onChange={(e) => setDeactive(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label htmlFor="deactive" className="ml-2 block text-sm text-gray-900">Deactive</label>
                        </div>
                    </div>
                </fieldset>
                <div className='col-span-2 flex flex-col items-center justify-center'>
                    <span>
                        Total student
                    </span>
                    <span className='font-[inter] font-semibold'>
                        {allStudent.length}
                    </span>
                </div>
                <button
                    onClick={handleFilter}
                    className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                    {loading ? <div className='flex items-center justify-center'><span className='mr-2'></span><CircularLoading size={25} /></div> :
                        <div className='flex items-center'>
                            <UserPlus size={17} className='mr-2' />Search</div>}
                </button>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-1 mt-10'>
                {loading ? (
                    <CircularLoading size={30} />
                ) : (
                    allStudent && allStudent.length > 0 ? (
                        allStudent.map((student, i) => (
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
                                paymentDue={student.paymentDue}
                            />
                        ))
                    ) : (
                        <p>No students found.</p>
                    )
                )}
            </div>
            {/* </SideBar> */}
        </>
    )
}
