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
  const [restoredState,setRestoredState]=useState([]);
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
    let storedToken=JSON.parse(sessionStorage.getItem("gameInfo"))
    console.log("payload of data:",data.payload);
    let gameData=data.payload;
    console.log("gameData.gameStateInfo:",gameData.gameMap);
    console.log("handleReconnect executed!")
    if(data.type==="yesReconnect"){
      setName(storedToken.You.name);
      setOppName(storedToken.opponent.name);
      setGameId(storedToken.game_id);
      setOppId(storedToken.opponent.id);
      setMyId(storedToken.You.id);
      setSymbol(storedToken.You.Symbol);
      console.log("the recieved game map:",gameData.gameMap);
      setRestoredState([...gameData.gameMap]);
      setGameState("Playing");
    }

  }

  const checkConnection=(gameInfo)=>{
    console.log("sending reconnect...");
    ws.current.send(JSON.stringify({type:"reconnect",payload:gameInfo}));
}


  useEffect(()=>{
    ws.current=new WebSocket("https://tictactoegame-by-atharvasail.onrender.com");
    ws.current.onopen=()=>{
      let gameInfo=JSON.parse(sessionStorage.getItem("gameInfo"));
      console.log("Websocket connected!");
      setWsReady(true);
      if(gameInfo){
            checkConnection(gameInfo);
            ws.current.addEventListener("message",handleReconnect);
      }
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


//     // ws.current.onopen=()=>{
//     //   
//     // }

//     console.log("ws.current is:",ws.current);
    
//     return()=>{
//       // if(ws.current){
//       //   ws.current.removeEventListener("message",handleReconnect);
//       // }
//     }
// },[]);

  useEffect(()=>{
    console.log("wsReady:",wsReady);
  },[wsReady]);



  return (
    <div className='flex h-screen w-screen border-2 border-black bg-[#041216]'>
      {gameState==="Waiting"?<StartingPage ws={ws.current} setLoader={setLoader} loader={loader} gameState={gameState}/>:
      <Main_UI ws={ws.current} myId={myId} name={name} gameId={gameId} setGameState={setGameState} isWaiting={isWaiting} setIsWaiting={setIsWaiting} oppName={oppName} oppId={oppId} Symbol={Symbol} restoredState={restoredState} wsReady={wsReady}/>}
    </div>
  )
}

export default App
