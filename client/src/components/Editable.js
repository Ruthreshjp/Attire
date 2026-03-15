import React, { useState, useEffect, useRef } from 'react';

export const EditableText = ({ tag: Tag = 'span', content, onChange, isEditMode, className, style }) => {
    const [text, setText] = useState(content || '');
    const textRef = useRef(null);

    useEffect(() => {
        setText(content || '');
    }, [content]);

    const handleBlur = () => {
        if (textRef.current) {
            const newText = textRef.current.innerText;
            setText(newText);
            onChange(newText);
        }
    };

    if (!isEditMode) {
        return <Tag className={className} style={style}>{content}</Tag>;
    }

    return (
        <Tag
            ref={textRef}
            className={`${className} editable-text-active`}
            style={{ 
                ...style, 
                outline: '1px dashed #c5a059', 
                minWidth: '20px', 
                display: Tag === 'span' || Tag === 'p' ? 'inline-block' : style?.display 
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
        >
            {text}
        </Tag>
    );
};

export const EditableImage = ({ src, onChange, isEditMode, className, style, alt }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isEditMode) {
        return <img src={src} className={className} style={style} alt={alt} />;
    }

    return (
        <div className="editable-image-container" style={{ position: 'relative', cursor: 'pointer', ...style }} onClick={() => fileInputRef.current?.click()}>
            <img src={src} className={className} style={{ ...style, width: '100%', border: '2px dashed #c5a059' }} alt={alt} />
            <div className="editable-image-overlay" style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(197, 160, 89, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
                Change Image
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </div>
    );
};
