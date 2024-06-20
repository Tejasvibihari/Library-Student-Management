import React, { useState, useRef } from 'react';
import SideBar from "../components/Sidebar";
import JoditEditor from 'jodit-react';
import OnlineStatusCard from '../components/OnlineStatusCard';

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
                Hello
                <OnlineStatusCard />
            </SideBar>
        </>
    );
}