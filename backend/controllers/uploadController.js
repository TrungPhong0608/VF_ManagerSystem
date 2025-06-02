const xlsx = require('xlsx');
const Stats = require('../models/statsModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình Multer để lưu file tạm
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tạo thư mục uploads nếu chưa tồn tại
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /xlsx|xls/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
        }
    },
    limits: { fileSize: 20*1024 * 1024 } // Giới hạn 5MB
}).single('file');

exports.uploadFile = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        // Kiểm tra nếu không có file được upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng chọn file Excel để upload'
            });
        }

        try {
            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const result = {
                success: true,
                message: 'File uploaded and processed successfully',
                sheets: {}
            };

            // Xử lý từng sheet trong file Excel
            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];

                // Chuyển sheet thành JSON (header ở dòng 1)
                const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                if (data.length < 2) {
                    result.sheets[sheetName] = {
                        processed: false,
                        message: 'Sheet không có dữ liệu (ít hơn 2 dòng)'
                    };
                    continue;
                }

                // Lấy header (dòng đầu tiên)
                const headers = data[0].map(h => h ? h.toString().trim() : '');
                const rows = data.slice(1); // Bỏ qua dòng header

                // Chuyển đổi dữ liệu thành mảng các object
                const jsonData = rows.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] !== undefined ? row[index] : null;
                    });
                    return obj;
                });

                // Lưu thông tin sheet vào kết quả
                result.sheets[sheetName] = {
                    processed: true,
                    headers: headers,
                    rowCount: jsonData.length,
                    sampleData: jsonData.slice(0, 3) // Trả về 3 dòng đầu làm mẫu
                };

                // Xử lý đặc biệt cho sheet ADAS_issue_list
                if (sheetName.trim().toLowerCase() === 'adas_issue_list') {
                    try {
                        await Stats.uploadData(jsonData);
                        result.sheets[sheetName].message = 'Dữ liệu đã được lưu vào database';
                    } catch (dbError) {
                        result.sheets[sheetName].processed = false;
                        result.sheets[sheetName].error = dbError.message;
                    }
                }
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } finally {
            // Xóa file tạm sau khi xử lý (tuỳ chọn)
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    });
};