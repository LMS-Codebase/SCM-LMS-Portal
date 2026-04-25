import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// receiving props in RichTextEditor- input & setInput
function RichTextEditor({ input, setInput, field = "description" }) {

    const handleChange = (content) => {
        setInput({ ...input, [field]: content });
    }

  return <ReactQuill theme="snow" value={input[field] || ""} onChange={handleChange} />;
}

export default RichTextEditor
