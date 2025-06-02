const db = require('./db');

class Stats {
    /**
     * Lấy tất cả dữ liệu thống kê từ bảng vehicle_stats
     * @returns {Promise<Array>} Mảng các bản ghi thống kê
     */
    static async getAll() {
        const [rows] = await db.execute(`
      SELECT 
        function_name AS Function,
        da_check AS 'DA-check',
        no_issue AS 'No issue',
        issue AS Issue,
        kpi_issue AS 'KPI issue',
        cant_check AS 'Can\'t check',
        limitation AS Limitation,
        vehicle_issue AS 'Vehicle issue',
        no_data AS 'No data',
        data_error AS 'Data error',
        total_events AS 'Total events',
        total_bugs_found AS 'Total bugs found'
      FROM vehicle_stats 
      ORDER BY function_name
    `);
        return rows;
    }

    /**
     * Tải lên dữ liệu mới vào bảng vehicle_stats
     * @param {Array} data - Dữ liệu từ file Excel
     * @returns {Promise<void>}
     */
    static async uploadData(data) {
        // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Xóa dữ liệu cũ
            await connection.execute('DELETE FROM vehicle_stats');

            // Chuẩn bị câu lệnh SQL để chèn dữ liệu
            const insertSql = `
        INSERT INTO vehicle_stats (
          function_name, da_check, no_issue, issue, kpi_issue, 
          cant_check, limitation, vehicle_issue, no_data, data_error, 
          total_events, total_bugs_found
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            // Chèn từng dòng dữ liệu
            for (const row of data) {
                const values = [
                    row.Function,
                    row['DA-check'] || 0,
                    row['No issue'] || 0,
                    row.Issue || 0,
                    row['KPI issue'] || 0,
                    row['Can\'t check'] || 0,
                    row.Limitation || 0,
                    row['Vehicle issue'] || 0,
                    row['No data'] || 0,
                    row['Data error'] || 0,
                    row['Total events'] || 0,
                    row['Total bugs found'] || 0
                ];

                await connection.execute(insertSql, values);
            }

            // Commit transaction nếu thành công
            await connection.commit();
        } catch (error) {
            // Rollback nếu có lỗi
            await connection.rollback();
            throw error;
        } finally {
            // Giải phóng connection
            connection.release();
        }
    }

    /**
     * Lấy dữ liệu tổng quan
     * @returns {Promise<Object>} Đối tượng chứa các thống kê tổng quan
     */
    static async getSummary() {
        const [result] = await db.execute(`
      SELECT 
        COUNT(*) AS totalFunctions,
        SUM(total_events) AS totalEvents,
        SUM(total_bugs_found) AS totalBugs,
        (SUM(issue) / SUM(da_check) * 100 AS issueRate
      FROM vehicle_stats
    `);

        return {
            totalFunctions: result[0].totalFunctions,
            totalEvents: result[0].totalEvents,
            totalBugs: result[0].totalBugs,
            issueRate: result[0].issueRate ? Number(result[0].issueRate.toFixed(2)) : 0
        };
    }

    /**
     * Lấy dữ liệu cho biểu đồ
     * @returns {Promise<Object>} Đối tượng chứa dữ liệu biểu đồ
     */
    static async getChartData() {
        const [rows] = await db.execute(`
      SELECT 
        function_name,
        total_events,
        total_bugs_found,
        no_issue,
        issue,
        (kpi_issue + cant_check + limitation + vehicle_issue + no_data + data_error) AS other
      FROM vehicle_stats
      ORDER BY function_name
    `);

        return {
            barData: {
                labels: rows.map(row => row.function_name),
                datasets: [
                    {
                        label: 'Total Events',
                        data: rows.map(row => row.total_events)
                    },
                    {
                        label: 'Total Bugs Found',
                        data: rows.map(row => row.total_bugs_found)
                    }
                ]
            },
            pieData: {
                labels: ['No Issue', 'Issue', 'Other'],
                datasets: [{
                    data: [
                        rows.reduce((sum, row) => sum + row.no_issue, 0),
                        rows.reduce((sum, row) => sum + row.issue, 0),
                        rows.reduce((sum, row) => sum + row.other, 0)
                    ]
                }]
            }
        };
    }
}

module.exports = Stats;