import { useState,useEffect, useRef } from 'react'
import Main_UI from './components/main_UI'
import './App.css'
import StartingPage from './components/StartingPage'

function App() {
  const [gameState,setGameState]=useState("Waiting");
  const [loader,setLoader]=useState(false);
  const [name,setName]=useState("");
  const [oppName,setOppName]=useState("");
  const [gameId,setGameId]=useState(null);
  const [currentDevice,setCurrentDevice]=useState("PC");
  const [isWaiting,setIsWaiting]=useState(false);
  const [connecting,setConnecting]=useState(false);
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
      setMyId(gameData.You.id);
      setSymbol(gameData.You.Symbol);
      console.log(gameData.opponent.id);
      setLoader(false);
      setGameState("Playing");
    }
  }

  function connectToServer(){
    console.log("Connecting to server executed!");
    ws.current=new WebSocket(`${import.meta.env.VITE_SERVER_DOMAIN2}`);
  }

  function handleReconnect(e){
    let data=JSON.parse(e.data);
    let storedToken=JSON.parse(sessionStorage.getItem("gameInfo"))
    let gameData=data.payload;
    if(data.type==="yesReconnect"){
      setName(storedToken.You.name);
      setOppName(storedToken.opponent.name);
      setGameId(storedToken.game_id);
      setOppId(storedToken.opponent.id);
      setMyId(storedToken.You.id);
      setSymbol(storedToken.You.Symbol);
      setRestoredState([...gameData.gameMap]);
      setGameState("Playing");
    }

  }

  const checkConnection=(gameInfo)=>{
    console.log("sending reconnect...");
    ws.current.send(JSON.stringify({type:"reconnect",payload:gameInfo}));
}

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
    connectToServer();
    setConnecting(true);
    let timer=setInterval(()=>{
      if(ws.current.readyState === WebSocket.OPEN){
        console.log("Connected to the server!");
        setConnecting(false);
        clearInterval(timer)
      }else{
        connectToServer();
      }
    },2500);

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

    // ws.current.onerror=(error)=>{
    //   console.log("Some error occured:",error);
    // }
    ws.current.onclose=()=>{
      console.log("WebSocket Closed!");
      setWsReady(false);
    }

    window.addEventListener("resize",handleResize);

    return ()=>{
      window.removeEventListener("resize",handleResize);
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
      {gameState==="Waiting"?<StartingPage ws={ws.current} setLoader={setLoader} loader={loader} gameState={gameState} connecting={connecting} currentDevice={currentDevice}/>:
      <Main_UI ws={ws.current} myId={myId} name={name} gameId={gameId} setGameState={setGameState} isWaiting={isWaiting} setIsWaiting={setIsWaiting} oppName={oppName} oppId={oppId} Symbol={Symbol} restoredState={restoredState} wsReady={wsReady} currentDevice={currentDevice}/>}
    </div>
  )
}

export default App
