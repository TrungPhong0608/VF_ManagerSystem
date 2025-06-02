import React, { useState } from 'react';
import { Container, Typography, CssBaseline } from '@mui/material';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import StatsTable from './components/StatsTable';
import Charts from './components/Charts';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    setRefresh(prev => !prev);
  };

  return (
      <>
        <CssBaseline />
        <Container maxWidth="lg" style={{ marginTop: '20px', marginBottom: '40px' }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" style={{ marginBottom: '40px' }}>
            Hệ thống thống kê dự án VinFast
          </Typography>

          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <SummaryCards key={refresh} />
          <Charts key={refresh} />
          <StatsTable key={refresh} />
        </Container>
      </>
  );
}

export default App;