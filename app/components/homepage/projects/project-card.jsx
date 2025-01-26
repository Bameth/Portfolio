"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

function ProjectCard({ project }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const openModal = (index = 0) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    const totalImages = project.images.length;
    setSelectedImageIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % totalImages;
      } else {
        return (prevIndex - 1 + totalImages) % totalImages;
      }
    });
  };

  return (
    <div className="from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37] w-full">
      <div className="flex flex-row">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
        <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
      </div>
      <div className="px-4 lg:px-8 py-3 lg:py-5 relative">
        <div className="flex flex-row space-x-1 lg:space-x-2 absolute top-1/2 -translate-y-1/2">
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-red-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-orange-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-green-200"></div>
        </div>
        <p className="text-center ml-3 text-[#16f2b3] text-base lg:text-xl">
          {project.name}
        </p>
      </div>
      <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 lg:px-8 py-4 lg:py-8">
        <code className="font-mono text-xs md:text-sm lg:text-base">
          <div className="blink">
            <span className="mr-2 text-pink-500">const</span>
            <span className="mr-2 text-white">project</span>
            <span className="mr-2 text-pink-500">=</span>
            <span className="text-gray-400">{'{'}</span>
          </div>
          <div>
            <span className="ml-4 lg:ml-8 mr-2 text-white">name:</span>
            <span className="text-gray-400">{`'`}</span>
            <span className="text-amber-300">{project.name}</span>
            <span className="text-gray-400">{`',`}</span>
          </div>
          <div className="ml-4 lg:ml-8 mr-2">
            <span className=" text-white">tools:</span>
            <span className="text-gray-400">{` ['`}</span>
            {project.tools.map((tag, i) => (
              <React.Fragment key={i}>
                <span className="text-amber-300">{tag}</span>
                {project.tools?.length - 1 !== i && (
                  <span className="text-gray-400">{`', '`}</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-gray-400">{"],"}</span>
          </div>
          <div>
            <span className="ml-4 lg:ml-8 mr-2 text-white">myRole:</span>
            <span className="text-orange-400">{project.role}</span>
            <span className="text-gray-400">,</span>
          </div>
          <div>
            <span className="text-white">Description:</span>
            <span className="text-cyan-400">{' ' + project.description}</span>
            <span className="text-gray-400">,</span>
          </div>
          <div>
            <span className="text-gray-400">{`};`}</span>
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="bg-gradient-to-r from-[#1b2c68] to-[#3b4a9e] text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l hover:from-[#3b4a9e] hover:to-[#1b2c68] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#16f2b3] shadow-lg transition-all duration-300 ease-in-out"
              onClick={() => openModal()}
            >
              Voir Images
            </button>
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <button className="bg-gradient-to-r from-[#4e7fb7] to-[#3b6a97] text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l hover:from-[#3b6a97] hover:to-[#4e7fb7] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#16f2b3] shadow-lg transition-all duration-300 ease-in-out ml-4">
                  Voir Demo
                </button>
              </a>
            )}
          </div>
        </code>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
            style={{
              zIndex: 9999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#0d1224] rounded-2xl shadow-2xl p-6 lg:p-10 w-11/12 md:w-3/4 lg:w-3/4 xl:w-2/3 max-h-[90vh] relative overflow-hidden"
              style={{ zIndex: 10000 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors duration-300"
                style={{ zIndex: 10001 }}
              >
                <X size={36} strokeWidth={2} />
              </button>

              <h3 className="text-center text-2xl text-[#16f2b3] mb-6 font-bold">
                {project.name} - Galerie
              </h3>

              <div className="relative w-full h-[60vh] mb-6">
                <motion.img
                  key={project.images[selectedImageIndex]}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  src={project.images[selectedImageIndex]}
                  alt={`Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl shadow-lg"
                />

                {project.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => navigateImage('prev')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 m-2 transition"
                      style={{ zIndex: 10001 }}
                    >
                      <ChevronLeft size={32} color="white" />
                    </button>
                    <button 
                      onClick={() => navigateImage('next')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 m-2 transition"
                      style={{ zIndex: 10001 }}
                    >
                      <ChevronRight size={32} color="white" />
                    </button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 overflow-x-auto">
                {project.images.map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-pointer transition-all duration-300 rounded-lg 
                      ${index === selectedImageIndex 
                        ? 'border-2 border-[#16f2b3] opacity-100' 
                        : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={src}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-16 md:h-20 object-cover rounded-lg"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProjectCard;