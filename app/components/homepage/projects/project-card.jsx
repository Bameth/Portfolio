"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

function ProjectCard({ project }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imagesCache, setImagesCache] = useState(new Set());

  // Préchargement des images
  useEffect(() => {
    const preloadImages = async () => {
      const promises = project.images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImagesCache((prev) => new Set([...prev, src]));
            resolve(src);
          };
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, [project.images]);

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
    setImageLoading(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    setImageLoading(true);
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
    <div className="from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37] w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
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
        <p className="text-center ml-3 text-[#16f2b3] text-base lg:text-xl font-bold">
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
            <span className="text-white">tools:</span>
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
          <div className="flex justify-center mt-6 space-x-4">
            <button
              className="group relative bg-gradient-to-r from-[#1b2c68] to-[#3b4a9e] text-white px-8 py-3 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(22,242,179,0.3)]"
              onClick={() => openModal()}
            >
              <span className="relative z-10">Voir Images</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#16f2b3] to-[#3b4a9e] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <button className="group relative bg-gradient-to-r from-[#4e7fb7] to-[#3b6a97] text-white px-8 py-3 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(22,242,179,0.3)]">
                  <span className="relative z-10">Voir Demo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#16f2b3] to-[#3b6a97] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gradient-to-b from-[#0d1224] to-[#0a0d37] rounded-2xl shadow-2xl p-6 lg:p-10 w-11/12 md:w-4/5 lg:w-4/5 xl:w-3/4 max-h-[90vh] relative"
              style={{ zIndex: 10000 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/80 hover:text-red-400 transition-colors duration-300 bg-black/20 rounded-full p-2 backdrop-blur-sm"
                style={{ zIndex: 10001 }}
              >
                <X size={24} strokeWidth={2} />
              </button>

              <h3 className="text-center text-2xl text-[#16f2b3] mb-8 font-bold">
                {project.name} - Galerie
              </h3>

              <div className="relative w-full h-[60vh] mb-8 bg-black/20 rounded-xl overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-[#16f2b3] animate-spin" />
                  </div>
                )}
                <motion.img
                  key={project.images[selectedImageIndex]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={project.images[selectedImageIndex]}
                  alt={`Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl"
                  onLoad={() => setImageLoading(false)}
                />

                {project.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      style={{ zIndex: 10001 }}
                    >
                      <ChevronLeft size={28} className="text-white/90" />
                    </button>
                    <button 
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      style={{ zIndex: 10001 }}
                    >
                      <ChevronRight size={28} className="text-white/90" />
                    </button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-24 overflow-y-auto p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                {project.images.map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative cursor-pointer transition-all duration-300 rounded-lg overflow-hidden
                      ${index === selectedImageIndex 
                        ? 'ring-2 ring-[#16f2b3] ring-offset-2 ring-offset-[#0d1224]' 
                        : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageLoading(true);
                    }}
                  >
                    <img
                      src={src}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-16 object-cover rounded-lg"
                      loading="lazy"
                    />
                    {!imagesCache.has(src) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-[#16f2b3] animate-spin" />
                      </div>
                    )}
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