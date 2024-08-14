import React, { useState, useEffect, useRef } from 'react';
import JoditEditor from 'jodit-react';
// import SideBar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import client from '../services/axiosClient';
import { useSelector } from 'react-redux';
import CircularLoading from './ui/CircularLoading';
import { Forward } from 'lucide-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function EmailEditor() {
    const [loading, setLoading] = useState(false);
    const editor = useRef(null);
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [emails, setEmails] = useState([])
    const [to, setTo] = useState('')
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('');
    const [mailData, setMailData] = useState({})
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [alertStatus, setAlertStatus] = useState('')
    let editorContent = content;

    const handleEditorChange = (newContent) => {
        editorContent = newContent;
        console.log(editorContent)
    };

    // Alert Snackbar 
    const handleSnackOpen = () => {
        setSnackOpen(true);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };

    useEffect(() => {
        const getStudentEmail = async () => {
            try {
                const response = await client.get('/api/mail/getstudentemail', { params: { adminId } })
                setEmails(response.data.studentEmails)
            } catch (error) {
                console.log(error)
            }
        }
        getStudentEmail()

    }, [adminId])

    // Send Email

    const handleClick = async (e) => {
        e.preventDefault()
        // setContent(editorContent)
        const updatedMailData = {
            to,
            subject,
            body: editorContent,
            admin: adminId// Use the latest editor content directly
        };
        console.log(updatedMailData.body)
        try {
            setLoading(true)
            const response = await client.post('/api/mail/sendemail', updatedMailData)
            console.log(response.data.message)
            setTo('')
            setSubject('')
            setContent('')
            editorContent = ''
            handleSnackOpen()
            setAlertStatus(response.data.message)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            if (error.response && error.response.data && error.response.data.message) {
                setAlertStatus(error.response.data.message);
                handleSnackOpen()
            } else if (error.message) {
                setAlertStatus(error.message);
                handleSnackOpen()
            } else {
                setAlertStatus('An unknown error occurred');
                handleSnackOpen()
            }
        }
    }
    return (
        <div>

            {/* <SideBar > */}
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={alertStatus === "Email sent successfully" ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertStatus}
                </Alert>
            </Snackbar>
            <Breadcrumbs title="Compose Email" subTitle='Announcment' />
            <div className='shadow-lg p-4 rounded-md'>
                <form>
                    <div className='flex justify-between mb-4 gap-4'>
                        <div className='w-full'>
                            <label htmlFor="library-membership">To:</label>
                            <input
                                className='border rounded-lg w-full p-1'
                                list="membership-types"
                                name="library-membership"
                                placeholder="To"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                            <datalist id="membership-types">
                                <option value="All"></option>
                                {emails.map((email, i) => {
                                    return <option key={i} value={email}></option>
                                })}
                            </datalist>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="subject">Subject:</label>
                            <input
                                className='border rounded-lg w-full p-1'
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder='Subject'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required />
                        </div>
                    </div>
                    <div>
                        <JoditEditor
                            ref={editor}
                            value={content}
                            onChange={handleEditorChange}
                            config={{
                                height: 350 // Set the height to 400px or any other value as needed
                            }}
                        />
                    </div>
                    <div className='flex justify-end my-6'>
                        <button onClick={handleClick} type='submit' className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                            {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                <div className='flex items-center'>
                                    <Forward size={17} className='mr-2' />Send Email</div>}
                        </button>
                    </div>
                </form>
            </div>
            {/* </SideBar > */}
        </div >
    )
}
