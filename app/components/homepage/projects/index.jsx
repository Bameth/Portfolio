"use client";
import { projectsData } from '@/utils/data/projects-data';
import ProjectCard from './project-card';

const Projects = () => {
  return (
    <div id='projects' className="relative z-50 my-12 lg:my-24">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#16f2b3]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Section */}
      <div className="sticky top-10 z-10 animate-slideInDown">
        <div className="relative">
          {/* Glowing orb */}
          <div className="w-20 h-20 bg-gradient-to-r from-violet-400 to-[#16f2b3] rounded-full absolute -top-3 left-0 translate-x-1/2 filter blur-3xl opacity-40 animate-pulse" />

          <div className="flex items-center justify-start relative">
            <span className="bg-gradient-to-r from-[#1a1443] to-[#2d1b69] border border-[#16f2b3]/30 absolute left-0 w-fit text-white px-6 py-4 text-2xl lg:text-3xl font-bold rounded-xl shadow-lg backdrop-blur-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(22,242,179,0.3)] transition-all duration-300 cursor-default">
              <span className="bg-gradient-to-r from-white to-[#16f2b3] bg-clip-text text-transparent">
                MES PROJETS
              </span>
            </span>
            <span className="w-full h-[3px] bg-gradient-to-r from-[#1a1443] via-[#16f2b3] to-transparent rounded-full animate-expandWidth" />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {projectsData.slice(0, 6).map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>

        {/* View More Projects Button */}
        {projectsData.length > 6 && (
          <div className="flex justify-center mt-16 animate-slideInUp" style={{ animationDelay: '0.8s' }}>
            <button className="group relative px-8 py-4 bg-gradient-to-r from-[#1b2c68] to-[#3b4a9e] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-[0_0_30px_rgba(22,242,179,0.4)]">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#16f2b3] to-[#3b4a9e] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Button content */}
              <span className="relative z-10 flex items-center space-x-2">
                <span>Voir tous mes projets</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 text-center animate-fadeInUp" style={{ animationDelay: '1s' }}>
          <h3 className="text-2xl font-bold text-white mb-8">
            En quelques chiffres
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              {
                number: `${projectsData.length}+`,
                label: "Projets réalisés",
                color: "from-[#16f2b3] to-green-400",
                delay: '1.3s'
              },
              {
                number: `${new Set(projectsData.flatMap(p => p.tools)).size}+`,
                label: "Technologies",
                color: "from-purple-400 to-pink-400",
                delay: '1.4s'
              },
              {
                number: "3+",
                label: "Années d'expérience",
                color: "from-blue-400 to-cyan-400",
                delay: '1.5s'
              },
              {
                number: "100%",
                label: "Satisfaction client",
                color: "from-orange-400 to-red-400",
                delay: '1.6s'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative p-6 bg-gradient-to-br from-[#0d1224] to-[#1a1443] border border-[#1b2c68a0] rounded-xl hover:border-[#16f2b3]/50 transition-all duration-500 hover:-translate-y-1 animate-slideInUp"
                style={{ animationDelay: stat.delay }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#16f2b3]/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 animate-countUp`}>
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm lg:text-base font-medium">
                  {stat.label}
                </div>

                {/* Animated border */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#16f2b3] to-purple-500 group-hover:w-3/4 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center animate-fadeInUp" style={{ animationDelay: '1.8s' }}>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            Chaque projet est une nouvelle opportunité d'innover et de créer des solutions impactantes.
            Explorons ensemble votre prochain défi !
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#contact"
              className="px-8 py-3 bg-gradient-to-r from-[#16f2b3] to-green-400 text-black font-semibold rounded-xl hover:from-green-400 hover:to-[#16f2b3] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(22,242,179,0.5)]"
            >
              Discutons de votre projet
            </a>

            <a
              href="#about"
              className="px-8 py-3 border-2 border-[#16f2b3] text-[#16f2b3] font-semibold rounded-xl hover:bg-[#16f2b3] hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(22,242,179,0.3)]"
            >
              En savoir plus sur moi
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInDown {
          from { 
            opacity: 0; 
            transform: translateY(-50px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes expandWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes countUp {
          from { 
            opacity: 0; 
            transform: scale(0); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-slideInDown {
          animation: slideInDown 0.8s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-expandWidth {
          animation: expandWidth 1s ease-out 0.3s forwards;
          transform-origin: left;
          transform: scaleX(0);
        }
        .animate-countUp {
          animation: countUp 0.5s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Projects;