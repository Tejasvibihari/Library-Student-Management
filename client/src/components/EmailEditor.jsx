import React, { useState, useRef } from 'react';
import JoditEditor from 'jodit-react';
import SideBar from './Sidebar';
export default function EmailEditor() {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const contentFieldChanged = (newContent) => setContent(newContent);
    return (
        <div>

            <SideBar >
                <h1 className='text-lg font-[inter] py-2'>
                    Compose Email
                </h1>
                <div>
                    
                </div>
                <div className='border shadow-lg rounded-md p-4'>
                    <div className=''>

                    </div>
                    <JoditEditor
                        ref={editor}
                        value={content}
                        onChange={contentFieldChanged}
                        className='w-96'
                    />
                </div>
            </SideBar>
        </div>
    )
}
