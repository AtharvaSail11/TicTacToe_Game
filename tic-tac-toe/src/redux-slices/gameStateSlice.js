import { createSlice } from "@reduxjs/toolkit";


const gameStateSlice = createSlice({
    name: 'gameStateSlice',
    initialState: {
        name: '',
        oppName: '',
        gameId: null,
        isWaiting: false,
        connecting: false,
        oppId: null,
        myId: null,
        Symbol: null,
        restoredState: [],
        wsReady: false,
        gameState:'Waiting'
    },
    reducers: {
        startGame: (state, action) => {
            state.name = action.payload.name;
            state.oppName = action.payload.oppName;
            state.gameId = action.payload.gameId;
            state.isWaiting = action.payload.isWaiting;
            state.connecting = action.payload.connecting;
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
            state.wsReady=action.payload.wsReady;
        },
        isPlayerWaiting:(state,action)=>{
            state.isWaiting=action.payload.isWaiting
        }
    }

});

export const {startGame,reconnect,initWebSocket}=gameStateSlice.actions

export default gameStateSlice.reducer;