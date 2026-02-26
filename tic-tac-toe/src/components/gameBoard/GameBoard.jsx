import { useEffect, useRef, useState } from "react"
import WrongMoveAlert from "../Alert_Boxes/wrongMoveAlert";
import ResultAlertBox from "../Alert_Boxes/ResultAlertBox";
import { setWaitingStatus,setGameState } from "../../redux-slices/gameStateSlice";
import { useSelector,useDispatch } from "react-redux";

const GameBoard=({ws,currentDevice,moves,setMoves})=>{
    const positions=[1,2,3,4,5,6,7,8,9];
    const [wrongMoveAlert,setWrongMoveAlert]=useState(false);
    const [resultAlertBox,setResultAlertBox]=useState(false);
    const [result,setResult]=useState(null);
    console.log(positions);
    const gameboardStyles={
        PC:"h-[400px] w-[400px]",
        Mobile:"h-[300px] w-[300px]"
    }

    const {gameId,myId,oppId,Symbol,wsReady,isWaiting,gameState}=useSelector((state)=>state.gameStateSlice)

    const dispatch=useDispatch();

    
    useEffect(()=>{
        console.log("Current Device:",currentDevice);
    },[currentDevice])


    const handlePlayerMove=(position)=>{
            let moveArray=[...moves];
            moveArray.push({pos:position,move:Symbol})
            setMoves(moveArray);
            console.log("moves:",{pos:position,move:Symbol});
            console.log("websocket readyState:",ws.readyState);
            console.log("Ready state 2:",wsReady);

            if(ws.readyState===WebSocket.OPEN){
                ws.send(JSON.stringify({type:"move",payload:{pos:position,move:Symbol,gameId:gameId,myId:myId,oppId:oppId}}));
            }
    }

function handleRematch(decision){;
    if(decision){
        ws.send(JSON.stringify({type:"rematch",payload:{confirmation:true,gameId:gameId,senderId:myId,oppId:oppId}}));
        dispatch(setWaitingStatus(true));
    }else{
        ws.send(JSON.stringify({type:"rematch",payload:{confirmation:false,gameId:gameId,senderId:myId,oppId:oppId}}));
        dispatch(setGameState("Waiting"))
    }
    setResultAlertBox(false);
}

function updatePlayerMove(e){
    let data=JSON.parse(e.data);
    if(data.type==="wait"){
        let wrongPos=data.pos;
        setWrongMoveAlert(true);
        setMoves((prev)=>{
            let newArr=prev.filter((item)=>item.pos !== wrongPos);
            return newArr;
        }
    );
    }
    else if(data.type==="moveUpdate"){
        let moveData=data.moveData;
        console.log("move data recieved is:",data);
        setMoves((prev)=>[...prev,{pos:moveData.pos,move:moveData.move}]);
    }
    else if(data.type==="win"){
        setResult("win");
        setResultAlertBox(true);
    }
    else if(data.type==="lose"){
        setResult("lose");
        setResultAlertBox(true);
    }
    else if(data.type==="tie"){
        setResult("tie");
        setResultAlertBox(true);
    }
    else if(data.type==="reset"){
        setMoves([]);
         dispatch(setWaitingStatus(false));
        console.log("reset!");
    }
    else if(data.type==="close"){
        console.log("close");
         dispatch(setWaitingStatus(false));
        if(sessionStorage.getItem("gameInfo")){
            sessionStorage.removeItem("gameInfo");
        }
        setGameState("Waiting");
    }
}

    

    useEffect(()=>{
        ws.addEventListener("message",updatePlayerMove);
    },[]);

    useEffect(()=>{
        console.log("moves played are:",moves);
    },[moves]);

    
    return(
        <div className={`grid relative grid-rows-3 grid-cols-3 ${currentDevice==="PC"?gameboardStyles["PC"]:gameboardStyles["Mobile"]} gap-1`}>
            {
                positions.map((item,index)=>(
                    <div className="flex border-2 border-[#037971] justify-center items-center cursor-pointer" key={item} onClick={()=>handlePlayerMove(item)}>
                        {moves.map((currMove)=>(
                            currMove.pos===item&&<p className="text-4xl text-[#00BFB3]">{currMove.move}</p>
                        ))}
                    </div>
                ))
            }
            {wrongMoveAlert?<WrongMoveAlert setWrongMoveAlert={setWrongMoveAlert}/>:""}
            {resultAlertBox?<ResultAlertBox handleRematch={handleRematch} result={result}/>:""}
        </div>
    )
}

export default GameBoard;