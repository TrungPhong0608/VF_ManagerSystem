import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress
} from '@mui/material';
import {
    Functions as FunctionsIcon,
    Event as EventIcon,
    BugReport as BugReportIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

const SummaryCards = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/summary');
                setSummary(response.data);
            } catch (error) {
                console.error('Error fetching summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <LinearProgress />;
    }

    if (!summary) {
        return <Typography>Không có dữ liệu tổng quan</Typography>;
    }

    return (
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Tổng số Function
                        </Typography>
                        <Typography variant="h4" component="h2">
                            <FunctionsIcon color="primary" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {summary.totalFunctions}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Tổng số Events
                        </Typography>
                        <Typography variant="h4" component="h2">
                            <EventIcon color="secondary" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {summary.totalEvents}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Tổng số Bugs
                        </Typography>
                        <Typography variant="h4" component="h2">
                            <BugReportIcon color="error" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {summary.totalBugs}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Tỉ lệ Issue (%)
                        </Typography>
                        <Typography variant="h4" component="h2">
                            <ErrorIcon color="warning" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {summary.issueRate}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SummaryCards;