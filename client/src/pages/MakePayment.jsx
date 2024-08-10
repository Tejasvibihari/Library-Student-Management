import Breadcrumbs from "../components/Breadcrumbs";
import PaymentStudentTable from "../components/PaymentStudentTable";
import SideBar from "../components/Sidebar";
import client from "../services/axiosClient";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import CircularLoading from '../components/ui/CircularLoading'
import { UserPlus } from 'lucide-react';

export default function MakePayment() {
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [Student, setAllStudent] = useState([])
    const [sid, setSid] = useState('');
    const [studentName, setStudentName] = useState('')
    const [active, setActive] = useState(false)
    const [pending, setPending] = useState(false)
    const [deactive, setDeactive] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleFilter = async () => {
        setLoading(true)
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
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }


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
    return (
        <>
            <SideBar>
                <Breadcrumbs title="Make Payment" subTitle="Student" />
                <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mt-5 border p-4 shadow-md bg-white mb-4'>
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

                    </fieldset>
                    <button
                        onClick={handleFilter}
                        className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                        {loading ? <div className='flex items-center justify-center'><span className='mr-2'></span><CircularLoading size={25} /></div> :
                            <div className='flex items-center'>
                                <UserPlus size={17} className='mr-2' />Search</div>}
                    </button>
                </div>
                <PaymentStudentTable allStudent={Student} />
            </SideBar>
        </>
    )
}
