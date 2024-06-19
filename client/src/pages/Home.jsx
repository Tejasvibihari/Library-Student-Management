import React, { useState, useRef } from 'react';
import SideBar from "../components/Sidebar";
import JoditEditor from 'jodit-react';

export default function Home() {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const contentFieldChanged = (newContent) => setContent(newContent);

    return (
        <>
            <SideBar>
                <JoditEditor
                    ref={editor}
                    value={content}
                    onChange={contentFieldChanged}
                />
            </SideBar>
        </>
    );
}