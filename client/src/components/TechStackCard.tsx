import { 
  FaJs, 
  FaPython, 
  FaReact, 
  FaCss3, 
  FaNodeJs, 
  FaCube, 
  FaBook, 
  FaMarkdown,
  FaRobot,
  FaBrain,
  FaCodeBranch,
  FaGithub,
  FaBookOpen,
  FaEthereum
} from "react-icons/fa";
import { useTechStack } from "../hooks/use-portfolio-data";

// Tech item component
const TechItem = ({ icon, name }: { icon: React.ReactNode, name: string }) => (
  <div 
    className="tech-item flex items-center px-3 py-2 mr-4 border whitespace-nowrap card-rounded"
    style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.3))' }}
  >
    <span className="mr-2 text-base text-[currentColor]">{icon}</span>
    <span className="text-xs font-mono text-secondary">{name}</span>
  </div>
);

export default function TechStackCard() {
  const { data: techStackData, isLoading, error } = useTechStack();

  if (isLoading) {
    return (
      <div className="bg-transparent p-0 h-auto overflow-hidden card-rounded flex items-center justify-center min-h-[50px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mx-auto mb-1"></div>
          <p className="text-xs font-mono text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !techStackData) {
    return (
      <div className="bg-transparent p-0 h-auto overflow-hidden card-rounded flex items-center justify-center min-h-[50px]">
        <p className="text-xs font-mono text-secondary">Failed to load</p>
      </div>
    );
  }

  // Icon mapping for technologies
  const iconMap: { [key: string]: React.ReactNode } = {
    "JavaScript": <FaJs className="text-yellow-400" />,
    "Python": <FaPython className="text-blue-500" />,
    "React": <FaReact className="text-cyan-400" />,
    "Solidity": <FaEthereum className="text-purple-600" />,
    "Tailwind": <FaCss3 className="text-blue-600" />,
    "Node.js": <FaNodeJs className="text-green-500" />,
    "Blender": <FaCube className="text-orange-500" />,
    "Jupyter": <FaBook className="text-green-400" />,
    "Markdown": <FaMarkdown className="text-blue-400" />,
    "ChatGPT": <FaRobot className="text-purple-400" />,
    "ClaudeAI": <FaBrain className="text-indigo-400" />,
    "HuggingFace": <FaCodeBranch className="text-yellow-500" />,
    "GitHub": <FaGithub className="text-gray-400" />,
    "Obsidian": <FaBookOpen className="text-purple-500" />,
  };

  const technologies = techStackData.map((tech: any) => ({
    icon: iconMap[tech.tech_name] || <FaCodeBranch className="text-gray-400" />,
    name: tech.tech_name
  }));

  return (
    <div className="bg-transparent p-0 h-auto overflow-hidden card-rounded">
      <div className="relative overflow-hidden h-[36px] flex items-center">
        {/* Add a background and z-index to the STACK label so it covers scrolling items */}
        <div className="absolute left-0 top-0 h-full bg-background z-10 flex items-center">
          <h2 
            className="text-base font-sequel theme-text-primary pr-3 mr-3 border-r" 
            style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.3))' }}
          >STACK</h2>
        </div>
        <div className="tech-scroll absolute left-[80px] flex animate-scroll" style={{ width: "max-content" }}>
          {technologies.map((tech, index) => (
            <TechItem key={`tech-${index}`} icon={tech.icon} name={tech.name} />
          ))}
          {/* Duplicate items for seamless scrolling */}
          {technologies.map((tech, index) => (
            <TechItem key={`tech-dup-${index}`} icon={tech.icon} name={tech.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
