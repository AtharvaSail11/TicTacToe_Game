import GameBoard from "./gameBoard/GameBoard";
import { useState,useEffect } from "react";


const Main_UI=({ws,name,gameId,myId,oppName,oppId,Symbol,wsReady,isWaiting,setIsWaiting,setGameState,restoredState})=>{
    const [currentDevice,setCurrentDevice]=useState("PC");
    const [myTurn,setMyTurn]=useState();
    const [moves,setMoves]=useState([]);
    const elementStyle={
        playerNameBox:`flex flex-col items-center ${currentDevice==="Mobile"?"w-[80px]":"w-[100px]"}`
    }

    useEffect(()=>{
        setMoves(restoredState);
    },[restoredState])

    const handleResize=()=>{
        let maxWidth=window.innerWidth;
        console.log("maxwidth:",maxWidth);
        if(maxWidth <= 480){
            setCurrentDevice("Mobile")
        }
        else if(maxWidth > 480 && maxWidth <= 760){
            setCurrentDevice("Tablet");
        }
        else{
            setCurrentDevice("PC");
        }
    }

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
        window.addEventListener("resize",handleResize);
        return ()=>{
            window.removeEventListener("resize",handleResize);
        }
    },[])
    return(
        <div className="flex flex-col h-full w-full">
            <div className={`flex w-full justify-around ${currentDevice==="Mobile"?"text-base":"text-xl"} font-semibold text-[#00BFB3]`}>
            <div className={elementStyle.playerNameBox}><p>You{` (${Symbol})`}</p><p>{name}</p></div>
            <div className=" flex justify-center w-[156px]"><p>{myTurn?"Your Turn":"Opponent's Turn"}</p></div>
            <div className={elementStyle.playerNameBox}><p>Opponent</p><p>{oppName}</p></div>
            
            </div>
            
            <div className={`flex w-full justify-center ${currentDevice==="PC"?"mt-10":"mt-20"}`}>
            <GameBoard currentDevice={currentDevice} ws={ws} gameId={gameId} setGameState={setGameState} myId={myId} oppId={oppId} Symbol={Symbol} wsReady={wsReady} isWaiting={isWaiting} moves={moves} setMoves={setMoves} setIsWaiting={setIsWaiting}/>
            </div>

            {isWaiting?(<p>waiting...</p>):""}
            
            
        </div>
    )
}

export default Main_UI;