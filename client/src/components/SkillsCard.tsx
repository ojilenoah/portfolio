import { useSkills } from "../hooks/use-portfolio-data";

export default function SkillsCard() {
  const { data: skillsData, isLoading, error } = useSkills();

  if (isLoading) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-xs font-mono text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !skillsData) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <p className="text-xs font-mono text-secondary">Failed to load</p>
      </div>
    );
  }
  return (
    <div
      className="bg-cardBg p-0 h-full overflow-hidden border border-accent/20 card-rounded"
      style={{
        borderColor: "var(--border-accent-color, rgba(0, 117, 79, 0.25))",
      }}
    >
      <div
        className="flex items-center px-4 py-2 border-b"
        style={{
          borderColor: "var(--border-accent-color, rgba(0, 117, 79, 0.25))",
        }}
      >
        <h2 className="text-base font-sequel theme-text-primary">SKILLS</h2>
      </div>

      <div className="p-4 space-y-3">
        {skillsData.map((skill: any, index: number) => {
          const skillList = skill.skill_list.split(', ');
          const highlightedSkills = skill.highlighted_skills.split(', ');
          
          return (
            <div
              key={index}
              className="border-l-2 pl-2"
              style={{
                borderColor: "var(--border-accent-color, rgba(0, 117, 79, 0.4))",
              }}
            >
              <h3 className="text-xs font-sequel">{skill.category}</h3>
              <p className="text-xs font-mono text-secondary">
                {skillList.map((skillItem: string, skillIndex: number) => (
                  <span key={skillIndex}>
                    {highlightedSkills.includes(skillItem.trim()) ? (
                      <span className="text-accent">{skillItem.trim()}</span>
                    ) : (
                      skillItem.trim()
                    )}
                    {skillIndex < skillList.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
