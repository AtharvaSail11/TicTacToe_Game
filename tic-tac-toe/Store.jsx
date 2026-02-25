import { configureStore } from "@reduxjs/toolkit";
import gameStateReducer from './src/redux-slices/gameStateSlice'

export const Store=configureStore({
    reducer:{
        'gameStateSlice':gameStateReducer
    }
});