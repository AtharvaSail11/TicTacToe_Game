import React from "react";

const ConnectingBox=()=>{
  return(
    <div className='flex justify-center items-center absolute w-full h-full z-10'>
            <div className='flex flex-col justify-evenly items-center h-1/4 w-1/4 bg-[#023436] rounded-md'>
              <div className="flex flex-col items-center">
                <p className='text-[#03B5AA] font-semibold'>Connecting to the server</p>
                <p className='text-[#03B5AA] font-semibold'>Please Wait...</p>
              </div>    
            </div>
    </div>
  )
    
}

export default ConnectingBox;