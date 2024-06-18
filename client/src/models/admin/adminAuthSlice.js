import { createSlice } from '@reduxjs/toolkit'
const tokenFromStorage = localStorage.getItem('token');
const initialState = {
    loading: false,
    error: null,
    token: null,
    isAuthenticated: !!tokenFromStorage,
    currentAdmin: null
}

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        signUpStart: (state) => {
            state.loading = true
            state.error = null
        },
        signUpSuccess: (state, action) => {
            state.loading = false
            state.currentAdmin = action.payload
            state.error = null
        },
        signUpFailure: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.loading = false;
            state.currentAdmin = action.payload.admin;
            state.isAuthenticated = true;
            state.token = action.payload.token;

            // // Store token in local storage for persistence
            // localStorage.setItem('token', action.payload.token);
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOutSuccess: (state) => {
            state.token = null;
            state.admin = null;
            state.isAuthenticated = false;
        },
        adminLogout: (state) => {
            state.isAuthenticated = false;
            state.currentAdmin = null;
            state.token = null;
            state.loading = false;
            state.error = null;
        },
        // Update admin Account 
        updateAccountStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateAccountSuccess: (state, action) => {
            state.loading = false;
            state.currentAdmin = action.payload;
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
    signUpStart,
    signUpSuccess,
    signUpFailure,
    signInStart,
    signInSuccess,
    signOutSuccess,
    signInFailure,
    adminLogout,
    updateAccountStart,
    updateAccountSuccess,
    updateAccountFailure
} = adminSlice.actions

export default adminSlice.reducer