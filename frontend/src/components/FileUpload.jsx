import React, { useState } from 'react';
import axios from 'axios';
import { Button, LinearProgress, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Vui lòng chọn file trước khi upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setMessage('');
            const response = await axios.post('http://localhost:5000/api/upload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });

            setMessage('Upload thành công! ${response.data.rowCount} dòng đã được xử lý');
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (error) {
            let errorMsg = 'Lỗi khi upload'
            if (error.response) {
                errorMsg += `: ${error.response.data.error || error.response.data.message}`;
                if (error.response.data.details) {
                    errorMsg += ` (Chi tiết: ${JSON.stringify(error.response.data.details)})`;
                }
            } else {
                    errorMsg += `: ${error.message}`;
                }
                setMessage(errorMsg);
        } finally
            {
                setUploading(false);
            }
        };

    return (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px dashed #ccc', borderRadius: '4px' }}>
            <Typography variant="h6" gutterBottom>
                Upload File Excel
            </Typography>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
            />
            <label htmlFor="file-upload">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    style={{ marginRight: '10px' }}
                >
                    Chọn File
                </Button>
            </label>
            {file && <span>{file.name}</span>}
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{ marginLeft: '10px' }}
            >
                Upload
            </Button>

            {uploading && <LinearProgress style={{ marginTop: '10px' }} />}
            {message && (
                <Typography variant="body1" style={{ marginTop: '10px', color: message.includes('Lỗi') ? 'red' : 'green' }}>
                    {message}
                </Typography>
            )}
        </div>
    );
};

export default FileUpload;