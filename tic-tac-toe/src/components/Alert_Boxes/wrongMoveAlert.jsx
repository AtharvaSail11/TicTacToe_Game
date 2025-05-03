import react,{useState} from 'react';

const WrongMoveAlert=({setWrongMoveAlert})=>{
    return(
        <div className='flex justify-center items-center absolute w-full h-full z-10'>
            <div className='flex flex-col justify-evenly items-center h-1/2 w-3/4 bg-[#023436] rounded-md'>
                    <p className='text-[#03B5AA] font-semibold'>Wait for the opponent to play!</p>
                    <button type="button" className='w-[60px] h-[40px] bg-[#037971] text-[#041216] font-semibold rounded-lg' onClick={()=>{setWrongMoveAlert(false)}}>Ok</button>
            </div>
        </div>
    )
}

export default WrongMoveAlert;