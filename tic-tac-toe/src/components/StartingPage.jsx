import React,{ useEffect, useState } from "react";


const StartingPage=({ws,loader,setLoader})=>{
let [name,setName]=useState("");
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
        <div className="flex justify-center items-center w-full h-full">
            <div className="flex justify-around items-center flex-col h-[400px] w-max p-5">
            <h1 className="text-[60px] text-[#00BFB3]">Tic-Tac-Toe</h1>
            <input type="text" className="bg-transparent text-[#00BFB3]  border-2 border-[#049A8F] p-2 rounded-lg" id="name" placeholder="Enter Name" onChange={handleChange}/>
            {loader?(<p>Loading...</p>):""}
            <input className="w-1/2 border-2 border-[#03B5AA] rounded-2xl cursor-pointer p-2 bg-[#037971]" type="button" value="Start" onClick={registerPlayer}/>
            </div>
        </div>
    )
}

export default StartingPage;