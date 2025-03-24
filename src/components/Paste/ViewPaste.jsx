import React, { useContext, useEffect, useRef, useState } from "react";
import { BsCopy } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { NavLink } from "react-router";
import toast from "react-hot-toast";
import { NavbarContext } from "../../redux/NavbarContext";

const ViewPaste = () => {
    const { id } = useParams();
    const allPastes = useSelector((state) => state.pasteRed.allPastes);
    const paste = allPastes.find((item) => item.id === id);
    const lines = paste.pasteContent.split("\n").length;
    const { collapsed } = useContext(NavbarContext);
    const textAreaRef = useRef(null);
    const lineNumberRef = useRef(null);

    // Sync scrolling between textarea and line numbers
    const handleScroll = () => {
        if (lineNumberRef.current && textAreaRef.current) {
            lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop;
        }
    };

    return (
        <div className="flex h-100vh w-full mb-3">
            <div style={{ width: collapsed ? "4rem" : "14rem" }} className="transition-all duration-300"></div>
            <div className="h-[100%] min-w-10 max-w-[50rem] m-auto p-3 flex flex-col flex-1 gap-5 mt-6">
                <div className="flex justify-between gap-3">
                    <input
                        disabled
                        value={paste.pasteTitle}
                        type="text"
                        placeholder="Title"
                        className="w-full border border-gray-300 font-semibold rounded p-2 focus:outline-none focus:ring-2 focus:ring-gray-100"
                    />
                    <button>
                        <NavLink className={"flex gap-1 items-center bg-gray-200 p-2 rounded"} to="/paste">
                            <IoMdArrowRoundBack /> Back
                        </NavLink>
                    </button>
                </div>

                <div className="border border-gray-300 rounded min-h-[500px] max-h-[500px] w-full flex flex-col overflow-hidden">
                    <div className="relative p-2">
                        Your content
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(paste.pasteContent);
                                toast.success("Copied");
                            }}
                            className="absolute right-3 cursor-pointer"
                        >
                            <BsCopy />
                        </button>
                    </div>

                    <div className="flex-1 flex rounded-l overflow-hidden">
                        <div
                            ref={lineNumberRef}
                            className="bg-gray-100 px-3 py-2 text-gray-600 text-right select-none overflow-hidden"
                            style={{ minWidth: "2.5rem" }}
                        >
                            {Array.from({ length: lines }, (_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>

                        <textarea
                            ref={textAreaRef}
                            disabled
                            className="w-full bg-gray-100 h-full p-2 resize-none focus:outline-none overflow-auto scrollbar-thin"
                            value={paste.pasteContent}
                            onScroll={handleScroll}
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPaste;
