import { useState,useEffect, useRef } from 'react'
import Main_UI from './components/main_UI'
import './App.css'
import StartingPage from './components/StartingPage'
import js from '@eslint/js';

function App() {
  const [gameState,setGameState]=useState("Waiting");
  const [loader,setLoader]=useState(false);
  const [name,setName]=useState("");
  const [oppName,setOppName]=useState("");
  const [gameId,setGameId]=useState(null);
  const [isWaiting,setIsWaiting]=useState(false);
  const [oppId,setOppId]=useState();
  const [myId,setMyId]=useState();
  const [Symbol,setSymbol]=useState();
  const [wsReady,setWsReady]=useState(false);
  const ws=useRef(null);
  

  function gameStart(e){
    let data=JSON.parse(e.data)
    if(data.type==='start'){
      let gameData=data.gameData;
      console.log("event data:",gameData);
      setName(gameData.You.name);
      setOppName(gameData.opponent.name);
      setGameId(gameData.game_id);
      setOppId(gameData.opponent.id);
      console.log("My Id:",gameData.You.id);
      sessionStorage.setItem("gameInfo",JSON.stringify(gameData));
      console.log("the saved game session is:",sessionStorage.getItem("gameInfo"));
      setMyId(gameData.You.id);
      setSymbol(gameData.You.Symbol);
      console.log(gameData.opponent.id);
      setLoader(false);
      setGameState("Playing");
    }
  }

  function handleReconnect(e){
    let data=JSON.parse(e.data);
    let gameData=data.gameData;
    if(data.type==="yesReconnect"){
      setName(gameData.You.name);
      setOppName(gameData.opponent.name);
      setGameId(gameData.game_id);
      setOppId(gameData.opponent.id);
      setMyId(gameData.You.id);
      setSymbol(gameData.You.Symbol);
      setLoader(false);
      setGameState("Playing");
    }

  }


  useEffect(()=>{
    ws.current=new WebSocket("ws://localhost:8080");
    ws.current.onopen=()=>{
      console.log("Websocket connected!");
      setWsReady(true);
    }

    ws.current.addEventListener("message",gameStart);

    ws.current.onerror=(error)=>{
      console.log("Some error occured:",error);
    }
    ws.current.onclose=()=>{
      console.log("WebSocket Closed!");
      setWsReady(false);
    }
    return ()=>{
      if(ws.current)ws.current.close();
    } 
  },[]);


//   useEffect(()=>{
//     let gameInfo=JSON.parse(sessionStorage.getItem("gameInfo"));
//     console.log("session token found:",gameInfo.You.name);
//     if(!gameInfo){return}
//     const checkConnection=()=>{
//       if(ws.current && ws.current.readyState===WebSocket.OPEN){
//         console.log("sending reconnect...");
//         ws.current.send(JSON.stringify({type:"reconnect",payload:gameInfo}));
//       }else{
//         console.log("retrying in 5 seconds");
//         setTimeout(checkConnection,5000);
//       }
//     }
//     ws.current.addEventListener("message",handleReconnect);
//     checkConnection();
//     return()=>{
//       ws.current.removeEventListener("message",handleReconnect);
//     }
// },[]);

  useEffect(()=>{
    console.log("wsReady:",wsReady);
  },[wsReady])



  return (
    <div className='flex h-screen w-screen border-2 border-black bg-[#041216]'>
      {gameState==="Waiting"?<StartingPage ws={ws.current} setLoader={setLoader} loader={loader} gameState={gameState}/>:
      <Main_UI ws={ws.current} myId={myId} name={name} gameId={gameId} setGameState={setGameState} isWaiting={isWaiting} setIsWaiting={setIsWaiting} oppName={oppName} oppId={oppId} Symbol={Symbol} wsReady={wsReady}/>}
    </div>
  )
}

export default App
