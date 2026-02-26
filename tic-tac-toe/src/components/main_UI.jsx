import { useSelector,useDispatch } from "react-redux";
import GameBoard from "./gameBoard/GameBoard";
import { useState,useEffect } from "react";



const Main_UI=({ws,restoredState,currentDevice})=>{
    const [myTurn,setMyTurn]=useState();
    const [moves,setMoves]=useState([]);
    const elementStyle={
        playerNameBox:`flex flex-col items-center ${currentDevice==="Mobile"?"w-[80px]":"w-[100px]"}`
    }

    const {name,oppName,Symbol,isWaiting}=useSelector((state)=>state.gameStateSlice)

    const dispatch=useDispatch();

    useEffect(()=>{
        setMoves(restoredState);
    },[restoredState])


    function handleTurn(){
        if(moves.length > 0){
            if(moves[moves.length-1].move === Symbol){
                setMyTurn(false);
             }else{
                 setMyTurn(true);
             }
        }else{
            if(Symbol === "X"){
                setMyTurn(true);
             }else{
                 setMyTurn(false);
             }
        }
        
    }

    useEffect(()=>{
        handleTurn();
    },[moves]);
    

    useEffect(()=>{
        console.log('name:',name);
    },[name])
    return(
        <div className="flex flex-col h-full w-full">
            <div className={`flex w-full justify-around ${currentDevice==="Mobile"?"text-base":"text-xl"} font-semibold text-[#00BFB3]`}>
            <div className={elementStyle.playerNameBox}><p>You{` (${Symbol})`}</p><p>{name}</p></div>
            <div className=" flex justify-center w-[156px]"><p>{myTurn?"Your Turn":"Opponent's Turn"}</p></div>
            <div className={elementStyle.playerNameBox}><p>Opponent</p><p>{oppName}</p></div>
            
            </div>
            
            <div className={`flex w-full justify-center ${currentDevice==="PC"?"mt-10":"mt-20"}`}>
            <GameBoard currentDevice={currentDevice} ws={ws} moves={moves} setMoves={setMoves}/>
            </div>

            {isWaiting?(<p>waiting...</p>):""}
            
            
        </div>
    )
}

export default Main_UI;