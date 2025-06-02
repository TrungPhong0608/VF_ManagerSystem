import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Charts = () => {
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
        return <LinearProgress />;
    }

    const barData = {
        labels: stats.map(item => item.function_name),
        datasets: [
            {
                label: 'Total Events',
                data: stats.map(item => item.total_events),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Bugs Found',
                data: stats.map(item => item.total_bugs_found),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const pieData = {
        labels: ['No Issue', 'Issue', 'Other'],
        datasets: [
            {
                data: [
                    stats.reduce((sum, item) => sum + item.no_issue, 0),
                    stats.reduce((sum, item) => sum + item.issue, 0),
                    stats.reduce((sum, item) => sum + item.kpi_issue + item.cant_check + item.limitation + item.vehicle_issue + item.no_data + item.data_error, 0)
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Grid container spacing={3} style={{ marginTop: '20px' }}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Sự kiện và lỗi theo từng chức năng
                        </Typography>
                        <div style={{ height: '400px' }}>
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Phân phối trạng thái
                        </Typography>
                        <div style={{ height: '400px' }}>
                            <Pie
                                data={pieData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Charts;