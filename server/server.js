// const express = require('express');
// const app = express();
const ws = require('ws');
const cors = require('cors');
const uniqueid = require('short-unique-id');
const uid = new uniqueid({ length: 10 })
const redis=require('redis');
// app.use(express.json());
// app.use(cors());
const server = new ws.Server({ port: 8080 });
let games = new Map();
let rematch = new Map();
let players = [];
let socketStore = new Map();
let chatData= new Map();
const redisClient=redis.createClient();
redisClient.on('error',(error)=>console.log('error occured while connecting to redis:',error));

async function connectToRedis(params) {
    await redisClient.connect()
    console.log('Connected to redis!');
}

connectToRedis();




function win(game) {
    const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]];
    let blankPlaces = game.gameMap.includes("");
    console.log("Blank spaces:", blankPlaces);
    winConditions.forEach((item) => {
        let pos1 = item[0];
        let pos2 = item[1];
        let pos3 = item[2];

        if (game.gameMap[pos1] === 'X' && game.gameMap[pos2] === 'X' && game.gameMap[pos3] === 'X') {
            let p1 = Object.entries(game).find((item) => {
                if (typeof (item[1]) === 'object') {
                    return item[1].Symbol === 'X';
                }
            });

            let p2 = Object.entries(game).find((item) => {
                if (typeof (item[1]) === 'object') {
                    return item[1].Symbol === 'O';
                }
            });

            socketStore.get(p1[1].socketId).send(JSON.stringify({ type: "win", message: "You Win!" }));
            socketStore.get(p2[1].socketId).send(JSON.stringify({ type: "lose", message: "You Lose!" }));


        } else if (game.gameMap[pos1] === 'O' && game.gameMap[pos2] === 'O' && game.gameMap[pos3] === 'O') {
            let p1 = Object.entries(game).find((item) => {
                if (typeof (item[1]) === 'object') {
                    return item[1].Symbol === 'O';
                }
            });

            let p2 = Object.entries(game).find((item) => {
                if (typeof (item[1]) === 'object') {
                    return item[1].Symbol === 'X';
                }
            });

            socketStore.get(p1[1].socketId).send(JSON.stringify({ type: "win", message: "You Win!" }));
            socketStore.get(p2[1].socketId).send(JSON.stringify({ type: "lose", message: "You Lose!" }));
        }
    })
    if (!blankPlaces) {
        let p1 = Object.entries(game).find((item) => {
            if (typeof (item[1]) === 'object') {
                return item[1].Symbol === 'X';
            }
        });

        let p2 = Object.entries(game).find((item) => {
            if (typeof (item[1]) === 'object') {
                return item[1].Symbol === 'O';
            }
        });

        if (p1 && p2) {
            socketStore.get(p1[1].socketId).send(JSON.stringify({ type: "tie", message: "It's a Tie!" }));
            socketStore.get(p2[1].socketId).send(JSON.stringify({ type: "tie", message: "It's a Tie!" }));
        }
    }
}

async function createRoom(data, socketId) {
    if (players.length % 2 === 0) {
        players.push({ socketId: socketId, id: uid.rnd(), name: data.payload, Symbol: 'X' });
    } else {
        players.push({ socketId: socketId, id: uid.rnd(), name: data.payload, Symbol: 'O' });
    }


    if (players.length === 2) {
        const gameId = uid.rnd()
        // games.set(gameId, { game_id: gameId, player1: players[0], player2: players[1], gameMap: ["", "", "", "", "", "", "", "", ""], currMove: "X" });
        await redisClient.hSet('games',gameId,JSON.stringify({ game_id: gameId, player1: players[0], player2: players[1], gameMap: ["", "", "", "", "", "", "", "", ""], currMove: "X" }))
        chatData.set(gameId,[]);
        players = [];
        // const currentGame = games.get(gameId);
        const currentGame=JSON.parse(await redisClient.hGet('games',gameId))
        socketStore.get(currentGame.player1.socketId).send(JSON.stringify({ type: "start", gameData: { game_id: currentGame.game_id, You: currentGame.player1, opponent: currentGame.player2 } }));
        socketStore.get(currentGame.player2.socketId).send(JSON.stringify({ type: "start", gameData: { game_id: currentGame.game_id, You: currentGame.player2, opponent: currentGame.player1 } }));
    }

}

async function handleMoves(data) {
    console.log("Move:", data.payload.move);

    // let game = games.get(data.payload.gameId)
    let game=JSON.parse(await redisClient.hGet('games',data.payload.gameId));
    if (game.currMove !== data.payload.move) {
        let me = Object.entries(game).find((item) => {
            if (typeof (item[1]) === 'object') {
                return item[1].id === data.payload.myId;
            }
        });

        socketStore.get(me[1].socketId).send(JSON.stringify({ type: "wait", pos: data.payload.pos }));

    } else {
        game.gameMap[data.payload.pos - 1] = data.payload.move;
        console.log("gameMap:", game.gameMap);
        let opp = Object.entries(game).find((item) => {
            if (typeof (item[1]) === 'object') {
                return item[1].id === data.payload.oppId;
            }
        });

        socketStore.get(opp[1].socketId).send(JSON.stringify({ type: "moveUpdate", moveData: { pos: data.payload.pos, move: data.payload.move } }));
        win(game);
        if (game.currMove === "X") {
            game.currMove = "O";
        } else {
            game.currMove = "X";
        }
        await redisClient.hSet('games',data.payload.gameId,JSON.stringify(game))
    }

}

async function handleChat(data){
    const messageObj=data;
    const messageData=messageObj.payload;

    const chatMessageObj={name:messageData.name,messageText:messageData.messageText,id:messageData.myId}

    console.log('data.payload:',messageData);
    let game=JSON.parse(await redisClient.hGet('games',messageData.gameId));
    let prevChats=chatData.get(messageData.gameId);
    prevChats.push(chatMessageObj);

    
    let oppData = Object.entries(game).find((item) => {
            return typeof (item[1]) === 'object' && item[1].id === messageData.oppId;
    });

    console.log('oppData:',oppData);
    console.log('oppData.socketId:',oppData[1].socketId);

    const oppSocket=socketStore.get(oppData[1].socketId);

    console.log('oppSocket:',oppSocket)

    oppSocket.send(JSON.stringify({type:'updateChat',payload:chatMessageObj}));

    chatData.set(prevChats);
}

async function handleReconnect(data, socketId) {
    console.log("The reconnection data recieved is:", data);
    // let gameInfo = games.get(data.payload.game_id);
    let gameInfo=JSON.parse(await redisClient.hGet('games',data.payload.game_id));
    console.log("HandleReconnect function executed!");
    if (gameInfo) {
        let newGameMap = [];
        gameInfo.gameMap.forEach((item, index) => {
            if (item !== "") {
                newGameMap.push({ pos: index + 1, move: item })
            }
        });


        let You = Object.entries(gameInfo).find((item) => {
            return typeof (item[1]) === 'object' && item[1].id === data.payload.You.id;
        });

        if (You) {
            const [key, obj] = You;
            obj.socketId = socketId;
        }
        You.socketId = socketId;

        socketStore.get(socketId).send(JSON.stringify({ type: "yesReconnect", payload: { gameMap: newGameMap, currMove: gameInfo.currMove, updatedSocket: socketId } }));
    }
}

async function handleRematch(data) {
    let game = JSON.parse(await redisClient.hGet('games',data.payload.gameId));
    if (!rematch.has(data.payload.gameId)) {
        rematch.set(data.payload.gameId, { gameId: data.payload.gameId, confirmations: [] });
    }
    if (game) {
        console.log("Yes,senderId:", data.payload.senderId);

        let currentRematchIndex = rematch.get(data.payload.gameId)
        currentRematchIndex.confirmations.push(data.payload.confirmation)
        if (currentRematchIndex.confirmations.length === 2) {
            if (currentRematchIndex.confirmations[0] && currentRematchIndex.confirmations[1]) {

                game.gameMap = ["", "", "", "", "", "", "", "", ""];
                game.currMove = "X";
                socketStore.get(game.player1.socketId).send(JSON.stringify({ type: "reset" }));
                socketStore.get(game.player2.socketId).send(JSON.stringify({ type: "reset" }));
                currentRematchIndex.confirmations = [];
            } else {
                console.log("second condition executed");

                let p1 = Object.entries(game).find((item) => {
                    if (typeof (item[1]) === 'object') {
                        return item[1].id === data.payload.senderId;
                    }
                });

                let p2 = Object.entries(game).find((item) => {
                    if (typeof (item[1]) === 'object') {
                        return item[1].id === data.payload.oppId;
                    }
                });

                // console.log("p1=>player1:", p1);

                if (p1[1].socketId) {
                    socketStore.get(p1[1].socketId).send(JSON.stringify({ type: "close", message: "connection closed!" }));
                }
                if (p2[1].socketId) {
                    socketStore.get(p2[1].socketId).send(JSON.stringify({ type: "close", message: "connection closed!" }));
                }

                await redisClient.del('games',data.payload.gameId);
            }
        }
    }

}

server.on('connection', (socket) => {
    const currentSocketId = uid.rnd();
    console.log(`client ${currentSocketId} joined the room!`);
    socketStore.set(currentSocketId, socket);
    socket.on('message', (jsonData) => {
        let data = JSON.parse(jsonData);
        console.log("The data recieved is:", data);
        if (data.type === 'register') {
            createRoom(data, currentSocketId);
        } else if (data.type === 'move') {
            handleMoves(data);
        } else if (data.type === 'rematch') {
            handleRematch(data);
        } else if(data.type === 'sendMessage'){
            handleChat(data);
        } else if (data.type === 'reconnect') {
            console.log("Reconnection request recieved!");
            handleReconnect(data, currentSocketId);
        }
    })

    socket.on('close', () => {
        console.log("Players:", players);
        console.log("games array:", games);
        socketStore.delete(currentSocketId);
        console.log(`client ${currentSocketId} disconnected!`);
    })
});

console.log("server started");





