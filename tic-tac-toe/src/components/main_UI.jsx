import GameBoard from "./gameBoard/GameBoard";
import { useState,useEffect } from "react";


const Main_UI=({ws,name,gameId,myId,oppName,oppId,Symbol,wsReady,isWaiting,setIsWaiting,setGameState})=>{
    const [currentDevice,setCurrentDevice]=useState("PC");

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

    

    useEffect(()=>{
        window.addEventListener("resize",handleResize);
        return ()=>{
            window.removeEventListener("resize",handleResize);
        }
    },[])
    return(
        <div className="flex flex-col h-full w-full">
            <div className="flex w-full justify-around text-xl font-semibold text-[#037971]">
            <p>You:{name}</p>
            <p>Opponent:{oppName}</p>
            </div>
            <div className={`flex w-full justify-center ${currentDevice==="PC"?"mt-10":"mt-20"}`}>
            <GameBoard currentDevice={currentDevice} ws={ws} gameId={gameId} setGameState={setGameState} myId={myId} oppId={oppId} Symbol={Symbol} wsReady={wsReady} isWaiting={isWaiting} setIsWaiting={setIsWaiting}/>
            </div>

            {isWaiting?(<p>waiting...</p>):""}
            
            
        </div>
    )
}

export default Main_UI;