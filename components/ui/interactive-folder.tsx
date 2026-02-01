'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const DUMMY_FILES = [
  { id: 1, name: 'assignment.doc', image: '/fileicons/DOC.svg' },
  { id: 2, name: 'me.jpg', image: '/fileicons/JPG.svg' },
  { id: 3, name: 'johnmayer.mp3', image: '/fileicons/MP3.svg' },
  { id: 4, name: 'bali.mp4', image: '/fileicons/MP4.svg' },
  { id: 5, name: 'ebook.pdf', image: '/fileicons/PDF.svg' },
  { id: 6, name: 'notes.txt', image: '/fileicons/TXT.svg' },
  { id: 7, name: 'statement.xlsx', image: '/fileicons/XLSX.svg' },
  { id: 8, name: 'export.zip', image: '/fileicons/ZIP.svg' },
];

const FolderIcon = () => (
    <Image
      src="/folder-svgrepo-com.svg"
      alt="Folder Icon"
      width={128}
      height={128}
      priority
      className="object-cover"
    />
);

type FileIconProps = { size: number; image: string };

const FileIcon = ({ size, image }: FileIconProps) => (
  <Image src={image} alt="File Icon" width={size} height={size} />
);

const InteractiveFolder = ({ folderName = 'New Folder' }: { folderName?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center flex-col w-fit">
      <motion.div
        initial={{ filter: 'blur(10px)', width: '128px', height: '128px' }}
        animate={{
          height: isOpen ? '210px' : '105px',
          width: isOpen ? '350px' : '122px',
          backgroundColor: isOpen ? '#f5f3ff' : 'rgba(108, 61, 183, 0.4)',
          borderRadius: '24px',
          cursor: isOpen ? 'default' : 'pointer',
          filter: 'blur(0px)',
          boxShadow: isOpen ? '0px 5px 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
        whileHover={{
          boxShadow: !isOpen
            ? '0px 3px 10px 0 rgba(0, 0, 0, 0.25)'
            : '0px 5px 10px 0 rgba(0, 0, 0, 0.1)',
          rotateZ: !isOpen ? '-4deg' : '0deg',
          translateY: !isOpen ? '-3px' : '0px',
        }}
        whileTap={{
          boxShadow: !isOpen
            ? '0px 0px 0px 0 rgba(0, 0, 0, 0.25)'
            : '0px 5px 10px 0 rgba(0, 0, 0, 0.1)',
          translateY: '0px',
          rotateZ: !isOpen ? '-2deg' : '0deg',
          scale: !isOpen ? 0.95 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={() => !isOpen && setIsOpen(!isOpen)}
        className="overflow-hidden flex items-center justify-center blur-sm"
      >
        <AnimatePresence mode="popLayout">
          {!isOpen && (
            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              exit={{ filter: 'blur(10px)', opacity: 0 }}
              whileHover={{ translateY: '3px', rotateZ: '4deg' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full h-full min-w-0 min-h-0 p-0 flex items-center justify-center"
            >
              <FolderIcon />
            </motion.div>
          )}

          {isOpen && (
            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              exit={{ filter: 'blur(10px)', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full w-full flex flex-col overflow-hidden relative"
            >
              <div className="h-7 w-full bg-violet-100 flex items-center justify-between">
                <div className="bg-violet-200/80 h-full flex items-center justify-center">
                  <motion.p
                    layout="position"
                    layoutId="folder-name"
                    className="text-violet-900 font-medium px-2 text-sm whitespace-nowrap truncate"
                  >
                    {folderName}
                  </motion.p>
                </div>
                <div className="flex-1 flex items-center justify-end px-1 h-full rounded-bl-lg bg-violet-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="hover:bg-violet-300/50 rounded-full cursor-pointer p-0.5"
                    aria-label="Close"
                  >
                    <X className="text-violet-900" size={14} />
                  </button>
                </div>
              </div>
              <div className="rounded-b-lg h-full w-full flex items-start justify-start bg-violet-50/80">
                <div
                  style={{ gridTemplateColumns: 'repeat(4, 50px)' }}
                  className="grid items-start justify-start gap-x-2 gap-y-4 overflow-y-scroll w-full p-2 py-4"
                >
                  {DUMMY_FILES.map((file, index) => (
                    <motion.div
                      key={`folder-item-${folderName}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="w-[50px] h-[54px] gap-2 flex flex-col items-center justify-start overflow-hidden"
                    >
                      <FileIcon size={30} image={file.image} />
                      <p className="text-xs text-violet-900 truncate text-left w-full">{file.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          layoutId="folder-name"
          className="text-violet-300 font-medium text-sm whitespace-nowrap truncate mt-1"
        >
          {folderName}
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveFolder;
