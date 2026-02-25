import { createSlice } from "@reduxjs/toolkit";


const gameStateSlice=createSlice({
    name:'gameStateSlice',
    initialState:{
        name:'',
        oppName:'',
        gameId:null,
        isWaiting:'',
        currentDevice:'',
        connecting:false,
        oppId:null,
        myId:null,
        Symbol:null,
        wsReady:false,
    },
    reducers:{
        startGame:(state)=>{
            
        }
    }

});

export default gameStateSlice.reducer;