import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@mui/material';

const StatsTable = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <Typography>Đang tải dữ liệu...</Typography>;
    }

    return (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Typography variant="h5" style={{ padding: '16px' }}>Thống kê chi tiết</Typography>
            <Table>
                <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Function</TableCell>
                        <TableCell align="right">DA-check</TableCell>
                        <TableCell align="right">No issue</TableCell>
                        <TableCell align="right">Issue</TableCell>
                        <TableCell align="right">KPI issue</TableCell>
                        <TableCell align="right">Can't check</TableCell>
                        <TableCell align="right">Limitation</TableCell>
                        <TableCell align="right">Vehicle issue</TableCell>
                        <TableCell align="right">No data</TableCell>
                        <TableCell align="right">Data error</TableCell>
                        <TableCell align="right">Total events</TableCell>
                        <TableCell align="right">Total bugs found</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stats.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">{row.function_name}</TableCell>
                            <TableCell align="right">{row.da_check}</TableCell>
                            <TableCell align="right">{row.no_issue}</TableCell>
                            <TableCell align="right">{row.issue}</TableCell>
                            <TableCell align="right">{row.kpi_issue}</TableCell>
                            <TableCell align="right">{row.cant_check}</TableCell>
                            <TableCell align="right">{row.limitation}</TableCell>
                            <TableCell align="right">{row.vehicle_issue}</TableCell>
                            <TableCell align="right">{row.no_data}</TableCell>
                            <TableCell align="right">{row.data_error}</TableCell>
                            <TableCell align="right">{row.total_events}</TableCell>
                            <TableCell align="right">{row.total_bugs_found}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StatsTable;