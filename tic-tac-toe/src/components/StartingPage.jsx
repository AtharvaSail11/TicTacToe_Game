import React,{ useEffect, useState } from "react";
import ConnectingBox from "./Alert_Boxes/ConnectingBox";
import { Loader2 } from "lucide-react";

const StartingPage=({ws,name,setName,loader,setLoader,connecting,currentDevice})=>{
 const handleChange=(e)=>{
    let name=e.target.value;
    console.log("Name:",name)
    setName(name);
 }

 let registerPlayer=()=>{
    ws.send(JSON.stringify({type:"register",payload:name}));
    setLoader(true);
 }
    return(
        <div className="flex relative justify-center items-center w-full h-full">
            <div className="flex justify-around items-center flex-col h-[400px] w-max p-5">
            <h1 className="text-[60px] text-[#00BFB3]">Tic-Tac-Toe</h1>
            <input type="text" className="bg-transparent text-[#00BFB3]  border-2 border-[#049A8F] p-2 rounded-lg" id="name" placeholder="Enter Name" onChange={handleChange}/>
            {connecting?(<ConnectingBox currentDevice={currentDevice}/>):""}
            {loader?(<p className="text-[#00BFB3] font-semibold">Loading...</p>):""}
            <button className={`flex items-center justify-center w-28 gap-2 border-2 rounded-2xl cursor-pointer p-2 ${loader?'bg-gray-500 border-gray-400':'bg-[#037971] border-[#03B5AA]'} `} onClick={registerPlayer} disabled={loader}>Start{loader?<Loader2 className="animate-spin text-gray-400" size={"20px"}/>:null}</button>
            </div>
        </div>
    )
}

export default StartingPage;