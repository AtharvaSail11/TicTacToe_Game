import { useEffect, useState } from "react"
const InGameChat = ({ws}) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const myId = 'abc123'

    const sendMessage = (e) => {
        const data = { socketId: 'cde345', name: 'abc', createdAt: new Date().toISOString(), messageText: text };
        setMessages((prev) => [...prev, data]);
    }

    useEffect(()=>{
        ws.addEventListener("message",sendMessage)
    },[])
    return (
        <div className="flex flex-col h-max w-max border-2 border-teal-600 p-4 text-teal-600">
            <p className="text-lg font-semibold text-center">Chats</p>
            {/*Chats */}
            <div className="flex flex-col h-52 overflow-y-auto">
                {messages.map((message, index) => (
                    <div className="flex flex-col">
                        <p className={`${message.socketId===myId ? 'text-green-500':'text-red-500'}`}>{message.name}</p>
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