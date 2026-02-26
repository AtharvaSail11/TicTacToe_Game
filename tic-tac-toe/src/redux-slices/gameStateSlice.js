import { createSlice } from "@reduxjs/toolkit";


const gameStateSlice = createSlice({
    name: 'gameStateSlice',
    initialState: {
        name: '',
        oppName: '',
        gameId: null,
        isWaiting: false,
        oppId: null,
        myId: null,
        Symbol: null,
        restoredState: [],
        wsReady: false,
        gameState:'Waiting',
    },
    reducers: {
        startGame: (state, action) => {
            state.name = action.payload.name;
            state.oppName = action.payload.oppName;
            state.gameId = action.payload.gameId;
            state.isWaiting = action.payload.isWaiting;
            state.oppId = action.payload.oppId;
            state.myId = action.payload.myId;
            state.Symbol = action.payload.Symbol;
            state.gameState=action.payload.gameState;
        },
        reconnect: (state, action) => {
            state.name = action.payload.name;
            state.oppName = action.payload.oppName;
            state.gameId = action.payload.gameId;
            state.oppId = action.payload.oppId;
            state.myId = action.payload.myId;
            state.Symbol = action.payload.Symbol;
            state.restoredState = action.payload.restoredState;
            state.gameState=action.payload.gameState;
        },
        initWebSocket:(state,action)=>{
            state.wsReady=action.payload;
        },
        setWaitingStatus:(state,action)=>{
            state.isWaiting=action.payload;
        },
        setGameState:(state,action)=>{
            state.gameState=action.payload
        }
    }

});

export const {startGame,reconnect,initWebSocket,setWaitingStatus,setGameState}=gameStateSlice.actions

export default gameStateSlice.reducer;