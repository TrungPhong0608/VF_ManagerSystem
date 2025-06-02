const xlsx = require('xlsx');
const Stats = require('../models/statsModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình Multer tối ưu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /\.(xlsx|xls)$/i;
    const validMimetypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/octet-stream'
    ];

    const isExtValid = filetypes.test(file.originalname);
    const isMimeValid = validMimetypes.includes(file.mimetype);

    if (isExtValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single('file');

exports.uploadFile = async (req, res) => {
    try {
        // Xử lý upload file
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) return reject(err);
                if (!req.file) return reject(new Error('Vui lòng chọn file Excel để upload'));
                resolve();
            });
        });

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath, { cellDates: true });

        // Kiểm tra sheet bắt buộc
        const requiredSheet = 'ADAS_issue_list';
        const sheetNames = Object.keys(workbook.Sheets).map(sheet => sheet.trim());

        // Tìm sheet không phân biệt hoa thường và khoảng trắng
        const foundSheet = sheetNames.find(sheet =>
            sheet.toLowerCase() === requiredSheet.toLowerCase()
        );

        if (!foundSheet) {
            throw new Error(`Không tìm thấy sheet "${requiredSheet}". Các sheet có sẵn: ${sheetNames.join(', ')}`);
        }

        // Sử dụng tên sheet chính xác từ file
        const actualSheetName = workbook.SheetNames.find(name =>
            name.trim().toLowerCase() === requiredSheet.toLowerCase()
        );

        const worksheet = workbook.Sheets[actualSheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Kiểm tra dữ liệu không rỗng
        if (!jsonData || jsonData.length === 0) {
            throw new Error(`Sheet "${actualSheetName}" không có dữ liệu`);
        }

        // Kiểm tra cấu trúc dữ liệu
        const requiredColumns = [
            'Vehicle_Market', 'VIN', 'Co-driver', 'Date',
            'Current SW', 'Severity', 'Timestamp',
            'Function', 'Description', 'Feature_Category',
            'Raw Name', 'PIC', 'Date2', 'DA Result', 'DA_Note'
        ];
        // Chuẩn hóa dữ liệu
        const normalizedData = jsonData.map(row => {
            const normalizedRow = {};
            requiredColumns.forEach(col => {
                // Xử lý giá trị null/undefined/empty string
                const value = row[col];
                normalizedRow[col] = value !== undefined && value !== null && value !== '' ? value : null;

                // Chuẩn hóa kiểu dữ liệu cho một số trường đặc biệt
                if (col === 'Date' || col === 'Date2') {
                    normalizedRow[col] = value ? new Date(value) : null;
                }
                if (col === 'Km') {
                    normalizedRow[col] = value ? parseInt(value) || null : null;
                }
            });
            return normalizedRow;
        });

        // Lưu vào database
        const dbResult = await Stats.uploadData(normalizedData);

        res.status(200).json({
            success: true,
            message: 'Dữ liệu đã được import thành công',
            sheet: requiredSheet,
            rowCount: dbResult.rowCount,
            sampleData: normalizedData.slice(0, 3),
            stats: {
                totalRecords: normalizedData.length,
                importedRecords: dbResult.rowCount,
                skippedRecords: normalizedData.length - dbResult.rowCount
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorResponse = {
            success: false,
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && {
                details: {
                    stack: error.stack,
                    file: req.file ? {
                        name: req.file.originalname,
                        size: req.file.size,
                        type: req.file.mimetype
                    } : null
                }
            })
        };

        res.status(statusCode).json(errorResponse);
    } finally {
        // Dọn dẹp file tạm
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Lỗi khi xóa file tạm:', cleanupError);
            }
        }
    }
};