import { useEffect, useRef, useState } from "react"
import WrongMoveAlert from "../Alert_Boxes/wrongMoveAlert";
import ResultAlertBox from "../Alert_Boxes/ResultAlertBox";

const GameBoard=({ws,gameId,myId,oppId,Symbol,wsReady,isWaiting,setIsWaiting,setGameState,currentDevice,moves,setMoves})=>{
    const positions=[1,2,3,4,5,6,7,8,9];
    const [wrongMoveAlert,setWrongMoveAlert]=useState(false);
    const [resultAlertBox,setResultAlertBox]=useState(false);
    const [result,setResult]=useState();
    const [playAgain,setPlayAgain]=useState();
    console.log(positions);
    const gameboardStyles={
        PC:"h-[400px] w-[400px]",
        Mobile:"h-[300px] w-[300px]"
    }


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
                console.log("move to send:",{type:"move",payload:{pos:position,move:Symbol,gameId:gameId,myId:myId,oppId:oppId}});
                ws.send(JSON.stringify({type:"move",payload:{pos:position,move:Symbol,gameId:gameId,myId:myId,oppId:oppId}}));
            }
    }

function handleRematch(decision){;
    setResult(decision);
    setResultAlertBox(true);
    if(playAgain){
        ws.send(JSON.stringify({type:"rematch",payload:{confirmation:true,gameId:gameId,senderId:myId,oppId:oppId}}));
        setIsWaiting(true);
    }else{
        ws.send(JSON.stringify({type:"rematch",payload:{confirmation:false,gameId:gameId,senderId:myId,oppId:oppId}}));
    }
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
        handleRematch("win");
    }
    else if(data.type==="lose"){
        handleRematch("lose");
    }
    else if(data.type==="tie"){
        handleRematch("tie");
    }
    else if(data.type==="reset"){
        setMoves([]);
        setIsWaiting(false);
        console.log("reset!");
    }
    else if(data.type==="close"){
        console.log("close");
        setIsWaiting(false);
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
            {resultAlertBox?<ResultAlertBox setResultAlertBox={setResultAlertBox} result={result} setPlayAgain={setPlayAgain}/>:""}
        </div>
    )
}

export default GameBoard;