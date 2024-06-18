import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
const [snackOpen, setSnackOpen] = useState(false);

const handleSnackOpen = () => {
    setSnackOpen(true);
};

const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }

    setSnackOpen(false);
};
export default function SnackAlert() {
    return (
        <>
            <div>
                <Button onClick={handleSnackOpen}>Open Snackbar</Button>
                <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                    <Alert
                        onClose={handleSnackClose}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        This is a success Alert inside a Snackbar!
                    </Alert>
                </Snackbar>
            </div>
        </>
    )
}
