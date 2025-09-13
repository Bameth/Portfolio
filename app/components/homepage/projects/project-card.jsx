"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Eye, Github, ExternalLink } from 'lucide-react';

function ProjectCard({ project, index }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    project.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    setIsLoaded(true);
  }, [project.images]);

  const openModal = (imageIndex = 0) => {
    setSelectedImageIndex(imageIndex);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImageIndex(0);
    document.body.style.overflow = 'unset';
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
    <>
      <div
        className={`group relative bg-gradient-to-br from-[#0d1224] via-[#1a1443] to-[#0a0d37] border border-[#1b2c68a0] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        style={{
          transitionDelay: `${index * 0.1}s`
        }}
      >
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#16f2b3]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

        {/* Header with terminal dots */}
        <div className="relative">
          <div className="flex flex-row">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
            <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
          </div>
          <div className="px-6 py-4 relative">
            <div className="flex flex-row space-x-2 absolute top-1/2 -translate-y-1/2">
              <div className="h-3 w-3 rounded-full bg-red-400 animate-pulse" />
              <div className="h-3 w-3 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-center text-[#16f2b3] text-lg font-semibold truncate ml-16">
              {project.name}
            </p>
          </div>
        </div>

        {/* Image preview */}
        <div className="px-6 mb-4">
          <div
            className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden cursor-pointer group/image hover:scale-105 transition-transform duration-300"
            onClick={() => openModal(0)}
          >
            <img
              src={project.images[0]}
              alt={project.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />

            {/* View gallery button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300">
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#16f2b3]/90 text-black rounded-lg font-medium hover:bg-[#16f2b3] transition-colors duration-200 transform hover:scale-105">
                <Eye size={16} />
                <span className="text-sm">Voir Images</span>
              </button>
            </div>

            {/* Image counter */}
            {project.images.length > 1 && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                {project.images.length} photos
              </div>
            )}
          </div>
        </div>

        {/* Code-style content */}
        <div className="px-6 pb-6">
          <div className="bg-[#0a0d37]/50 border border-indigo-900/50 rounded-xl p-4 font-mono text-sm">
            <div className="space-y-1">
              <div>
                <span className="text-pink-500">const</span>
                <span className="text-white ml-2">project</span>
                <span className="text-pink-500 ml-2">=</span>
                <span className="text-gray-400 ml-2">{'{'}</span>
              </div>

              <div className="ml-4">
                <span className="text-white">tools:</span>
                <span className="text-gray-400 ml-1">[</span>
                <div className="ml-4 flex flex-wrap gap-1 mt-1">
                  {project.tools.slice(0, 4).map((tool, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/30 hover:bg-amber-500/30 hover:scale-105 transition-all duration-200">
                      {tool}
                    </span>
                  ))}
                  {project.tools.length > 4 && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200">
                      +{project.tools.length - 4}
                    </span>
                  )}
                </div>
                <span className="text-gray-400">],</span>
              </div>

              <div className="ml-4">
                <span className="text-white">role:</span>
                <span className="text-orange-400 ml-1">"{project.role}"</span>
                <span className="text-gray-400">,</span>
              </div>

              <div className="ml-4">
                <span className="text-white">status:</span>
                <span className="text-cyan-400 ml-1">{project.status}</span>
              </div>

              <div>
                <span className="text-gray-400">{'};'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => openModal(0)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1b2c68] to-[#3b4a9e] text-white rounded-lg hover:from-[#3b4a9e] hover:to-[#1b2c68] transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Eye size={16} />
              <span className="text-sm">Galerie</span>
            </button>

            <div className="flex space-x-2">
              {project.code && (
                <a
                  href={project.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12"
                >
                  <Github size={16} />
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#16f2b3] hover:bg-[#14d9a5] text-black rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Gallery */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-[#0d1224] rounded-2xl border border-[#1b2c68a0] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1b2c68a0]">
              <h3 className="text-2xl font-bold text-[#16f2b3]">
                {project.name} - Galerie
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-all duration-300 hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Main Image */}
              <div className="relative h-[60vh] mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                <img
                  key={project.images[selectedImageIndex]}
                  src={project.images[selectedImageIndex]}
                  alt={`${project.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                />

                {/* Navigation Arrows */}
                {project.images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-[#16f2b3]/80 text-white hover:text-black rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-[#16f2b3]/80 text-white hover:text-black rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white rounded-full text-sm">
                  {selectedImageIndex + 1} / {project.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex justify-center">
                <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full">
                  {project.images.map((src, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${index === selectedImageIndex
                          ? 'border-[#16f2b3] shadow-lg shadow-[#16f2b3]/30'
                          : 'border-gray-600 hover:border-gray-400'
                        }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={src}
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Description */}
              <div className="mt-6 p-4 bg-[#0a0d37]/50 rounded-xl border border-indigo-900/50">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

export default ProjectCard;