"use client";
import Image from "next/image";
import { projectsData } from "@/utils/data/projects-data";
import ProjectCard from "./project-card";

const Projects = () => {
  return (
    <div
      id="projects"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <Image
        src="/section.svg"
        alt=""
        width={1572}
        height={795}
        className="absolute top-0 -z-10"
      />

      {/* Gradient top line */}
      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent w-full" />
        </div>
      </div>

      {/* Section title */}
      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]" />
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            Mes Projets
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]" />
        </div>
      </div>

      {/* Grid */}
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto px-4">
          {projectsData.slice(0, 6).map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              featured={index === 0}
            />
          ))}
        </div>

        {projectsData.length > 6 && (
          <div className="flex justify-center mt-12">
            <button className="group flex items-center gap-3 px-8 py-4 bg-[#0d1224] border border-[#1b2c68]/60 rounded-xl hover:border-[#16f2b3]/40 transition-all duration-300">
              <span className="text-slate-300 group-hover:text-white text-sm font-semibold transition-colors">
                Voir tous les projets
              </span>
              <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                {projectsData.length - 6} de plus
              </span>
              <span className="text-[#16f2b3] text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                ↗
              </span>
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-20 max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl border border-[#1b2c68]/60 bg-[#0d1224] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 w-80 h-80 bg-[#16f2b3]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#16f2b3]/30 to-transparent" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-10 md:px-14 md:py-12">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-[#16f2b3] font-bold mb-3">
                Collaboration
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-3">
                Votre prochain projet commence
                <br />
                <span className="text-slate-400 font-light italic">
                  par une conversation.
                </span>
              </h3>
              <p className="text-slate-500 text-sm max-w-md">
                Je transforme vos idées en solutions concrètes et performantes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="#contact"
                className="relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#16f2b3] text-black font-bold text-sm rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-[#16f2b3]/20 hover:scale-105"
              >
                <span className="relative z-10">Discutons ensemble</span>
                <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-[#1b2c68] text-slate-400 font-semibold text-sm rounded-xl hover:border-slate-500 hover:text-white transition-all duration-300"
              >
                À propos de moi
              </a>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Projects;
