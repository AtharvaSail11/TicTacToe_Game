import React,{useState} from "react";

const ResultAlertBox=({result,handleRematch})=>{
    function handlePlayAgain(confirmation){
        handleRematch(confirmation);
    }
    return(
        <div className='flex justify-center items-center absolute w-full h-full z-10'>
            <div className='flex flex-col justify-evenly items-center h-1/2 w-3/4 bg-[#023436] rounded-md'>
            <div className="flex flex-col items-center">
            {(result==="win"&&<p className='text-[#03B5AA] font-semibold'>You Won!</p>||result==="lose"&&<p className='text-[#03B5AA] font-semibold'>You Lost!</p>||result==="tie"&&<p className='text-[#03B5AA] font-semibold'>It's a tie!</p>)}
            <p className='text-[#03B5AA] font-semibold'>do you want to play again?</p>
            </div>
            
                    <div className="flex justify-around w-[140px]">
                        <button type="button" className='w-[60px] h-[40px] bg-[#037971] text-[#041216] font-semibold rounded-lg' onClick={()=>{handlePlayAgain(true)}}>Yes</button>
                        <button type="button" className='w-[60px] h-[40px] bg-[#037971] text-[#041216] font-semibold rounded-lg' onClick={()=>{handlePlayAgain(false)}}>No</button>
                    </div>
                    
            </div>
        </div>
    )
}

export default ResultAlertBox;