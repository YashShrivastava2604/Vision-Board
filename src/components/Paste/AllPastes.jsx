import React, { useContext, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { FaRegCopy } from "react-icons/fa6";
import { FaRegClipboard } from "react-icons/fa";
import { FaRegShareSquare } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { useSearchParams } from 'react-router';
import { removeAllPastes, removePaste } from '../../redex/pasteSlice';
import { NavLink } from 'react-router';
import toast from 'react-hot-toast';
import { NavbarContext } from '../../redex/NavbarContext';

const AllPastes = () => {

  const pastes = useSelector((state)=>state.pasteRed.allPastes)
  const [searchTerm,setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { collapsed } = useContext(NavbarContext);

  const filteredData = pastes.filter((paste)=>paste.pasteTitle.toLowerCase().includes((searchTerm.toLowerCase())));

  const shareContent = async (content, format) => {
    if (!content.trim()) {
      toast.error("Nothing to share!");
      return;
    }
  
    let shareText = content; // Default to plain text
  
    // If content is JSON, prettify it
    if (format === "JSON") {
      try {
        const parsedJson = JSON.parse(content); // Validate JSON
        shareText = JSON.stringify(parsedJson, null, 2); // Pretty format JSON
      } catch (error) {
        toast.error("Invalid JSON format!");
        return;
      }
    }else if (format === "Code") {
      // Wrap code in Markdown-style triple backticks for formatting
      shareText = `\`\`\`\n${content}\n\`\`\``;
    }
  
    // Web Share API for supported browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shared Paste",
          text: shareText,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        toast.error("Sharing failed!");
      }
    } else {
      // Fallback: Copy to Clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard! Share manually.");
      } catch (error) {
        toast.error("Failed to copy content.");
      }
    }
  };
  
  

  return (
        <>
          <div style={{ width: collapsed ? "4rem" : "14rem" }} className="transition-all duration-300"></div>
          <div className="relative w-full ">
            {/* Search Icon */}
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {/* Input Field */}
            <input
                type="text"
                value={searchTerm}
                onChange={ (e) => setSearchTerm(e.target.value) }
                className="w-full border border-gray-300 rounded pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-gray-100"
                placeholder="Search..."
            />
          </div>
          <div className="border rounded-t border-gray-300  tracking-wider">
              <div className="border-b p-3  border-gray-300 flex justify-between items-center">
                  <h1 className="font-bold text-3xl">All Pastes</h1>
                  {
                    pastes.length > 0
                     && 
                     <button className='cursor-pointer hover:text-red-600 transition-all duration-200' onClick={()=>{
                      dispatch(removeAllPastes())
                      toast.error("All pastes deleted")
                    }}>
                      Delete All
                    </button>
                  }
              </div>
              <div className="border-b p-3 flex flex-col gap-3 border-gray-300">
                {/* <div className="border p-3 border-gray-300 ">
                
                </div> */}
                {
                  filteredData.length > 0 
                  &&
                  filteredData.map( (val) =>{
                    return(
                      <div key={val.id} className="min-h-[120px] border p-3 border-gray-300 flex justify-between flex-wrap gap-3 rounded relative ">
                        <div className=' flex flex-col gap-1 '>
                          <div className="max-w-90 max-h-20 line-clamp-2 overflow-hidden text-2xl font-semibold">
                            <p >{val.pasteTitle}</p>
                          </div>
                          <div className='p-2 max-w-90 max-h-60 overflow-hidden '>
                            <p className='font-light text-gray-500 line-clamp-5'>{val.pasteContent}</p>  
                          </div>
                        </div>  
                        

                        {/* BUTTONS                     */}

                        <div className='flex gap-1.5 '>
                          <button className="border h-10 w-9 rounded border-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-violet-500 hover:text-violet-500 hover:shadow-[0_4px_15px_rgba(79,70,229,0.5)]"
                          onClick={()=>{
                            navigator.clipboard.writeText(val.pasteContent)
                            toast.success("Copied to clipboard")
                          }}
                          >

                            {/* Copy */}
                            <FaRegClipboard />
                          </button>

                          {/* Edit */}
                          <button className="border h-10 w-9  rounded border-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-blue-500 hover:text-blue-500 hover:shadow-[0_4px_15px_rgba(37,99,235,0.5)]">
                            <NavLink to={`/paste/?pasteId=${val?.id}`}>
                              <FaEdit />
                            </NavLink>
                          </button>

                          {/* Share */}
                          <button 
                          onClick={()=>shareContent(val.pasteContent,val.format)} 
                          className="border h-10 w-9  rounded border-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-green-300 hover:text-green-400  hover:shadow-[0_4px_15px_rgba(22,163,74,0.5)]">
                            <FaRegShareSquare />
                          </button>

                          {/* View */}
                          <button className="border h-10 w-9  rounded border-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-yellow-400 hover:text-yellow-500 hover:shadow-[0_4px_15px_rgba(202,138,4,0.3)]">
                            <NavLink to={`/paste/${val?.id}`}>
                              <FaRegEye />
                            </NavLink>
                          </button>

                          {/* Delete */}
                          <button className="border h-10 w-9  rounded border-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-red-300 hover:text-red-400 hover:shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                          onClick={()=>dispatch(removePaste(val.id))}
                          >
                            <MdDelete />
                          </button>
                        </div>
                        
                        <div className='h-[3rem] w-full flex justify-between items-center'>
                          <div className='text-gray-700 font-semibold'>
                            {val.formatedDate}
                          </div>
                          <div className='border border-gray-300 font-semibold bg-gray-100 p-2 rounded'
                          >
                            {val.format}
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
          </div>
        </>
  )
}

export default AllPastes
