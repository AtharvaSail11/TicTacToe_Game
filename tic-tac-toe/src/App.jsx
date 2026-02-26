import { useState, useEffect, useRef } from 'react'
import Main_UI from './components/main_UI'
import './App.css'
import StartingPage from './components/StartingPage'
import { useSelector, useDispatch } from 'react-redux'
import { startGame, reconnect, initWebSocket, setWaitingStatus } from './redux-slices/gameStateSlice'

function App() {
  const [loader, setLoader] = useState(false);
  const [name, setName] = useState("");
  const ws = useRef(null);
  const {wsReady,gameState,isWaiting} = useSelector((state) => state.gameStateSlice);
  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);
  const [currentDevice, setCurrentDevice] = useState("PC");

  function gameStart(e) {
    let data = JSON.parse(e.data)
    if (data.type === 'start') {
      let gameData = data.gameData;
      console.log("event data:", gameData);
      const stateData = {
        name: gameData.You.name,
        oppName: gameData.opponent.name,
        gameId: gameData.game_id,
        connecting: false,
        oppId: gameData.opponent.id,
        myId: gameData.You.id,
        Symbol: gameData.You.Symbol,
        gameState: "Playing",
      }
      setLoader(false);
      dispatch(startGame(stateData))
      sessionStorage.setItem("gameInfo", JSON.stringify(gameData));
    }
  }

  useEffect(()=>{
    dispatch(setWaitingStatus(true));
  },[])

  useEffect(()=>{
         console.log('state:',isWaiting);
  },[isWaiting])

  function connectToServer() {
    console.log("Connecting to server executed!");
    ws.current = new WebSocket(`${import.meta.env.VITE_SERVER_DOMAIN2}`);
  }

  function handleReconnect(e) {
    let data = JSON.parse(e.data);
    let storedToken = JSON.parse(sessionStorage.getItem("gameInfo"))
    let gameData = data.payload;
    if (data.type === "yesReconnect") {
      const stateData = {
        name: storedToken.You.name,
        oppName: storedToken.opponent.name,
        gameId: storedToken.game_id,
        oppId: storedToken.opponent.id,
        myId: storedToken.You.id,
        Symbol: storedToken.You.Symbol,
        restoredState: [...gameData.gameMap],
        gameState: "Playing",
      }
      dispatch(reconnect(stateData))
    }

  }

  const checkConnection = (gameInfo) => {
    console.log("sending reconnect...");
    ws.current.send(JSON.stringify({ type: "reconnect", payload: gameInfo }));
  }

  const handleResize = () => {
    let maxWidth = window.innerWidth;
    console.log("maxwidth:", maxWidth);
    if (maxWidth <= 480) {
      setCurrentDevice("Mobile")
    }
    else if (maxWidth > 480 && maxWidth <= 760) {
      setCurrentDevice("Tablet");
    }
    else {
      setCurrentDevice("PC");
    }
  }


  useEffect(() => {
    connectToServer();
    setConnecting(true);
    let timer = setInterval(() => {
      if (ws.current.readyState === WebSocket.OPEN) {
        console.log("Connected to the server!");
        setConnecting(false);
        clearInterval(timer)
      } else {
        connectToServer();
      }
    }, 2500);

    ws.current.onopen = () => {
      let gameInfo = JSON.parse(sessionStorage.getItem("gameInfo"));
      console.log("Websocket connected!");
      dispatch(initWebSocket(true));
      if (gameInfo) {
        checkConnection(gameInfo);
        ws.current.addEventListener("message", handleReconnect);
      }
    }

    ws.current.addEventListener("message", gameStart);

    // ws.current.onerror=(error)=>{
    //   console.log("Some error occured:",error);
    // }
    ws.current.onclose = () => {
      console.log("WebSocket Closed!");
      dispatch(initWebSocket(false))
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ws.current) ws.current.close();
    }
  }, []);

  useEffect(() => {
    console.log("current state wsReady:", wsReady);
  }, [wsReady]);



  return (
    <div className='flex h-screen w-screen border-2 border-black bg-[#041216]'>
      {gameState === "Waiting" ? <StartingPage ws={ws.current} name={name} setName={setName} setLoader={setLoader} loader={loader} gameState={gameState} connecting={connecting} currentDevice={currentDevice} /> :
        <Main_UI ws={ws.current} wsReady={wsReady} currentDevice={currentDevice} />}
    </div>
  )
}

export default App
