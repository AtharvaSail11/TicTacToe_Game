const express=require('express');
const app=express();
const ws=require('ws');
const cors=require('cors');
const uniqueid=require('short-unique-id');
const uid=new uniqueid({length:10})
app.use(express.json());
app.use(cors());
const server=new ws.Server({ port:8080 });
let games=[];
let rematch=[];
let players=[];


function win(game){
    const winConditions = [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 0, 3, 6 ], [1, 4, 7], [ 2, 5, 8 ],
                [ 0, 4, 8 ], [ 2, 4, 6 ] ];
    let blankPlaces=game.gameMap.includes("");
    console.log("Blank spaces:",blankPlaces);
        winConditions.forEach((item)=>{
            let pos1=item[0];
            let pos2=item[1];
            let pos3=item[2];

            if(game.gameMap[pos1]==='X' && game.gameMap[pos2]==='X' && game.gameMap[pos3]==='X'){
                let p1=Object.entries(game).find((item)=>{
                    if(typeof(item[1])==='object'){
                        return item[1].Symbol==='X';
                    }
                });

                let p2=Object.entries(game).find((item)=>{
                    if(typeof(item[1])==='object'){
                        return item[1].Symbol==='O';
                    }
                });

                p1[1].playerSocket.send(JSON.stringify({type:"win",message:"You Win!"}));
                p2[1].playerSocket.send(JSON.stringify({type:"lose",message:"You Lose!"}));


            }else if(game.gameMap[pos1]==='O' && game.gameMap[pos2]==='O' && game.gameMap[pos3]==='O'){
                let p1=Object.entries(game).find((item)=>{
                    if(typeof(item[1])==='object'){
                        return item[1].Symbol==='O';
                    }
                });

                let p2=Object.entries(game).find((item)=>{
                    if(typeof(item[1])==='object'){
                        return item[1].Symbol==='X';
                    }
                });

                p1[1].playerSocket.send(JSON.stringify({type:"win",message:"You Win!"}));
                p2[1].playerSocket.send(JSON.stringify({type:"lose",message:"You Lose!"}));
            }
        })
                if(!blankPlaces){
                    let p1=Object.entries(game).find((item)=>{
                        if(typeof(item[1])==='object'){
                            return item[1].Symbol==='X';
                        }
                    });
    
                    let p2=Object.entries(game).find((item)=>{
                        if(typeof(item[1])==='object'){
                            return item[1].Symbol==='O';
                        }
                    });
    
                    if(p1 && p2){
                        p1[1].playerSocket.send(JSON.stringify({type:"tie",message:"It's a Tie!"}));
                        p2[1].playerSocket.send(JSON.stringify({type:"tie",message:"It's a Tie!"}));
                    }
                }
}

function createRoom(data,socket){
    if(players.length%2===0){
        players.push({playerSocket:socket,id:uid.rnd(),name:data.payload,Symbol:'X'});
    }else{
        players.push({playerSocket:socket,id:uid.rnd(),name:data.payload,Symbol:'O'});
    }

    
    if(players.length === 2){
        games.push({game_id:uid.rnd(),player1:players[0],player2:players[1],gameMap:["","","","","","","","",""],currMove:"X"});
        players=[];
        games[games.length-1].player1.playerSocket.send(JSON.stringify({type:"start",gameData:{game_id:games[games.length-1].game_id,You:games[games.length-1].player1,opponent:games[games.length-1].player2}}));
        games[games.length-1].player2.playerSocket.send(JSON.stringify({type:"start",gameData:{game_id:games[games.length-1].game_id,You:games[games.length-1].player2,opponent:games[games.length-1].player1}}));
    }

    console.log("The player connected is:",players);
    console.log("The games are:",games);
}

function handleMoves(data){
        console.log("Move:",data.payload.move);
        let game=games.find((item)=>item.game_id===data.payload.gameId);
        if(game.currMove !== data.payload.move){
            let me=Object.entries(game).find((item)=>{
                if(typeof(item[1])==='object'){
                    return item[1].id===data.payload.myId;
                }
            });
            me[1].playerSocket.send(JSON.stringify({type:"wait",pos:data.payload.pos}));
            
        }else{
            game.gameMap[data.payload.pos-1]=data.payload.move;
            console.log("gameMap:",game.gameMap);
            let opp=Object.entries(game).find((item)=>{
                if(typeof(item[1])==='object'){
                    return item[1].id===data.payload.oppId;
                }
            });
            opp[1].playerSocket.send(JSON.stringify({type:"moveUpdate",moveData:{pos:data.payload.pos,move:data.payload.move}}));
            win(game);
            if(game.currMove==="X"){
                game.currMove="O";
            }else{
                game.currMove="X";
            }
        }
        
}

function handleReconnect(data){
    let gameInfo=games.find((item)=>item.game_id === data.game_id);
    if(gameInfo){
        let You=Object.entries(gameInfo).find((item)=>{
            if(typeof(item[1])==='object'){
                return item[1].id===gameInfo.You.id;
            }
        });
        You.playerSocket.send(JSON.stringify({type:"yesReconnect",payload:{gameMap:gameInfo.gameMap,currMove:gameInfo.currMove}}));
}
}

function handleRematch(data){
    let game=games.find((item)=>item.game_id===data.payload.gameId);
    if(!rematch.find((item)=>item.gameId===data.payload.gameId)){
        rematch.push({gameId:data.payload.gameId,confirmations:[]});
    }
    if(game){
            console.log("Yes,senderId:",data.payload.senderId);
            let index=rematch.findIndex((item)=>item.gameId===data.payload.gameId);
            rematch[index].confirmations.push(data.payload.confirmation);
            console.log("rematch:",rematch);
            if(rematch[index].confirmations.length === 2){
                if(rematch[index].confirmations[0] && rematch[index].confirmations[1]){
                    let gameIndex=games.findIndex((item)=>item.game_id===data.payload.gameId);
                    games[gameIndex].gameMap=["","","","","","","","",""];
                    games[gameIndex].currMove="X";
                    games[gameIndex].player1.playerSocket.send(JSON.stringify({type:"reset"}));
                    games[gameIndex].player2.playerSocket.send(JSON.stringify({type:"reset"}));
                    rematch[index].confirmations=[];
                }else{
                    console.log("second condition executed");
                    let gameIndex=games.findIndex((item)=>item.game_id===data.payload.gameId);
                    console.log("games[gameIndex]:",games[gameIndex])
                    let p1=Object.entries(games[gameIndex]).find((item)=>{
                        if(typeof(item[1])==='object'){
                            return item[1].id===data.payload.senderId;
                        }
                    });
            
                    let p2=Object.entries(games[gameIndex]).find((item)=>{
                        if(typeof(item[1])==='object'){
                            return item[1].id===data.payload.oppId;
                        }
                    });

                    console.log("p1=>player1:",p1);
            
                    if(p1[1].playerSocket){
                        p1[1].playerSocket.send(JSON.stringify({type:"close",message:"connection closed!"}));
                    }
                    if(p2[1].playerSocket){
                        p2[1].playerSocket.send(JSON.stringify({type:"close",message:"connection closed!"}));
                    }

                    let new_games=games.filter((item)=>item.game_id !== data.payload.gameId);
                    games=new_games;
                }
            }
    }

}

server.on('connection',(socket)=>{
    console.log("A player has joined the room!");
    socket.on('message',(jsonData)=>{
        let data=JSON.parse(jsonData);
        console.log("The data recieved is:",data);
        if(data.type==='register'){
            createRoom(data,socket);
        }else if(data.type === 'move'){
            handleMoves(data);
        }else if(data.type === 'rematch'){
            handleRematch(data);
        }else if(data.type === 'reconnect'){
            handleReconnect(data);
        }
    })

    socket.on('close',()=>{
        console.log("Players:",players);
        console.log("games array:",games);
        console.log("client disconnected!");
    })
});

console.log("server started");





