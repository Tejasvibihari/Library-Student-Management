import { createSlice } from '@reduxjs/toolkit'
const tokenFromStorage = localStorage.getItem('token');
const initialState = {
    loading: false,
    error: null,
    token: null,
    isAuthenticated: false,
    currentStudent: null,
}

export const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.loading = false;
            state.currentStudent = action.payload;
            state.isAuthenticated = true;
            // state.token = action.payload.token;

            // // Store token in local storage for persistence
            // localStorage.setItem('token', action.payload.token);
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOutSuccess: (state) => {
            // state.token = null;
            state.Student = null;
            state.isAuthenticated = false;
        },
        StudentLogout: (state) => {
            state.isAuthenticated = false;
            state.currentStudent = null;
            // state.token = null;
            state.loading = false;
            state.error = null;
        },
        // Update Student Account 
        updateAccountStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateAccountSuccess: (state, action) => {
            state.loading = false;
            state.currentStudent = action.payload;
            state.error = null;
        },
        updateAccountFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const {
    signInStart,
    signInSuccess,
    signOutSuccess,
    signInFailure,
    StudentLogout,
    updateAccountStart,
    updateAccountSuccess,
    updateAccountFailure
} = studentSlice.actions

export default studentSlice.reducer