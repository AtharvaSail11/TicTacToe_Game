import React from "react";

const ConnectingBox=({currentDevice})=>{
  let isMobile=currentDevice === "Mobile";
  let isTab=currentDevice === "Tablet";
  let isPc=currentDevice === "PC";

  console.log(`isMobile:${isMobile},isTab:${isTab},isPc:${isPc},currentDevice:${currentDevice}`)


  return(
    <div className={`flex justify-center items-center absolute w-full h-full z-10`}>
            <div className={`flex flex-col justify-evenly items-center ${((isTab || isMobile) && 'h-[150px] w-[250px]') || (isPc && 'h-[150px] w-[300px]')} bg-[#023436] rounded-md`}>
              <div className="flex flex-col items-center">
                <p className='text-[#03B5AA] font-semibold'>Connecting to the server</p>
                <p className='text-[#03B5AA] font-semibold'>Please Wait...</p>
              </div>    
            </div>
    </div>
  )
    
}

export default ConnectingBox;