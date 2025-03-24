import React, { useContext, useEffect, useRef, useState } from "react";
import { BsCopy } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import AllPastes from "./AllPastes";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { addToPaste, updatePaste } from "../../redux/pasteSlice";
import { NavbarContext } from "../../redux/NavbarContext";
import toast from "react-hot-toast";
import './PasteHome.css'

const PasteHome = () => {
  const [format, setformat] = useState("Code");
  // const [privacy, setPrivacy] = useState("Public");
  const [title, setTitle] = useState("");
  const [val, setVal] = useState("");
  const allPaste = useSelector((state) => state.pasteRed.allPastes);
  const [searchParam, setSearchParam] = useSearchParams("");
  const pasteId = searchParam.get("pasteId");
  const dispatch = useDispatch();
  const { collapsed } = useContext(NavbarContext);

  const lines = val.split("\n").length;

  const textAreaRef = useRef(null);
  const lineNumberRef = useRef(null);

  // Sync scrolling between textarea and line numbers
  const handleScroll = () => {
    if (lineNumberRef.current && textAreaRef.current) {
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };


  useEffect(() => {
    
    if (pasteId) {
      const paste = allPaste.find((item) => item.id === pasteId);
      if (paste) {
        setTitle(paste.pasteTitle);
        setVal(paste.pasteContent);
      }else{
        setTitle('')
      }  
      
    }
  }, [pasteId, allPaste]);

  function createPaste() {
    const paste = {
      pasteTitle: title,
      pasteContent: val,
      id: pasteId || Date.now().toString(36),
      formatedDate: new Date(new Date().toISOString()).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }
      ),
      format: format,
    };

    if (pasteId) {
      dispatch(updatePaste(paste));
    } else {
      dispatch(addToPaste(paste));
    }

    setTitle("");
    setVal("");
    setSearchParam("");
  }

  return (
    <>
      <div className="flex h-100vh w-full mb-[30px] ">
        {/* Reserve space for the navbar based on its collapsed state */}
        <div style={{ width: collapsed ? "4rem" : "14rem" }} className="transition-all duration-300"></div>

        <div className="flex flex-1 justify-center items-center w-full">
          {/* Reduced max-w from 50rem to 40rem for a smaller container */}
          <div className="h-[100%] w-full min-w-[10rem]: max-w-[40rem] m-auto p-3 flex flex-col flex-1 gap-5 mt-6">
            <div className="flex flex-wrap gap-x-12 gap-y-5">
              <select
                onChange={(e) => setformat(e.target.value)}
                className="cursor-pointer bg-gray-100 border border-gray-400 rounded py-3 px-9"
              >
                <option value="Code">Code</option>
                <option value="JSON">JSON</option>
                <option value="Text">Text</option>
              </select>

              

              <button
                className="cursor-pointer bg-black text-white py-3 px-9 rounded"
                onClick={() => {
                  if (title.length && val.length) {
                    createPaste();
                  } else {
                    toast.error("Please fill all fields");
                  }
                }}
              >
                {pasteId ? "Update Paste" : "Create Paste"}
              </button>

              <button
                className="flex gap-1 justify-center items-center cursor-pointer bg-gray-100 text-black py-3 px-5 rounded"
                hidden={!pasteId}
                onClick={() => {
                  setTitle("");
                  setVal("");
                  setSearchParam("");
                }}
              >
                <CiCirclePlus className="text-2xl" /> New paste
              </button>
            </div>

            {/* Title Input */}
            <input
              value={title}
              type="text"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 font-semibold rounded p-2 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />

            {/* TextArea with Line Numbers */}
            {/* Changed min-h and max-h to reduce size from 500px to 300/400px */}
            <div className="border border-gray-300 rounded min-h-[300px] max-h-[400px] w-full flex flex-col overflow-auto">
              {/* Header with Copy Button */}
              <div className="relative p-2">
                Enter your content here
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(val);
                    toast.success("Copied");
                  }}
                  className="absolute right-3 cursor-pointer"
                >
                  <BsCopy />
                </button>
              </div>

              {/* Textarea Container with Line Numbers */}
              <div className=" flex-1 flex overflow-hidden rounded-l">
                
                <div
                  ref={lineNumberRef}
                  className="bg-gray-100 px-3 py-2 text-gray-600 text-right select-none overflow-hidden"
                  style={{ minWidth: "2rem" }}
                >
                  {Array.from({ length: lines }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textAreaRef}
                  className="w-full bg-gray-100 h-full p-2 resize-none focus:outline-none overflow-auto custom-scrollbar"
                  value={val}
                  onScroll={handleScroll}
                  onChange={(e) => setVal(e.target.value)}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                ></textarea>
              </div>
            </div>

            <AllPastes />
          </div>
        </div>
      </div>
    </>
  );
};

export default PasteHome;
