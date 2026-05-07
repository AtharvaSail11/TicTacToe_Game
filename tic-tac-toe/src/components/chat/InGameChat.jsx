import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";


const InGameChat = ({ws}) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');


    const {gameId,myId,oppId,name,oppName,Symbol,wsReady,isWaiting,gameState}=useSelector((state)=>state.gameStateSlice);

    const handleChat = (e) => {
        const data=JSON.parse(e.data);


        if(data.type === 'updateChat'){
            setMessages((prev)=>[...prev,data.payload]);
        }else if(data.type === 'recoverChats'){
            setMessages([...data.payload]);
        }
    }

    const sendMessage=()=>{
        const messageData = {gameId,myId,oppId,name,messageText:text};
        const currentMessage={name:name,messageText:text,id:myId};
        console.log('currentMessage:',currentMessage);
        ws.send(JSON.stringify({type:'sendMessage',payload:messageData}));
        setMessages((prev) => [...prev, currentMessage]);
    }

    useEffect(()=>{
        ws.addEventListener("message",handleChat);
    },[])
    return (
        <div className="flex flex-col h-max w-max border-2 border-teal-600 p-4 text-teal-600">
            <p className="text-lg font-semibold text-center">Chats</p>
            {/*Chats */}
            <div className="flex flex-col h-52 overflow-y-auto">
                {messages.map((message, index) => (
                    <div className="flex flex-col">
                        <p className={`${message.id===myId ? 'text-green-500':'text-red-500'}`}>{message.name}</p>
                        <p>{message.messageText}</p>
                    </div>
                ))}
            </div>

            {/*Input box */}
            <div className="flex">
                <input type="text" name="message" id="message" className="bg-transparent" onChange={(e) => setText(e.target.value)} />
                <button className="bg-teal-600 px-4 py-2 text-black rounded-lg" onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}

export default InGameChat;