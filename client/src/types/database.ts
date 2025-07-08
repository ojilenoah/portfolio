// Database types for Supabase integration
export interface DatabaseProject {
  id: number;
  title: string;
  description: string;
  technologies: string; // JSON string
  link: string;
  download_url?: string;
  image_url?: string;
  video_url?: string;
  project_type: 'web' | 'mobile' | 'desktop';
  is_featured: boolean;
  sort_order: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DatabaseExperience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies?: string; // JSON string
  company_url?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTestimonial {
  id: number;
  name: string;
  occupation: string;
  company?: string;
  text: string;
  avatar_url?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface DatabaseSkill {
  id: number;
  category: string;
  skill_list: string;
  highlighted_skills: string;
  sort_order: number;
  created_at: string;
}

export interface DatabaseTechStack {
  id: number;
  tech_name: string;
  icon_class: string;
  color: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface DatabaseFunFact {
  id: number;
  fact_text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DatabaseOther {
  id: number;
  title: string;
  description: string;
  link?: string;
  item_type: 'other' | 'tool' | 'resource' | 'tutorial' | 'template';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: number;
  name: string;
  title: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  cv_download_url?: string;
  profile_image_url?: string;
  profile_image_hover_url?: string;
  social_github?: string;
  social_linkedin?: string;
  social_twitter?: string;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseContact {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  project_type?: string;
  budget_range?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Transform functions to convert database types to frontend types
export function transformDatabaseProject(dbProject: DatabaseProject) {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    technologies: JSON.parse(dbProject.technologies || '[]'),
    link: dbProject.link,
    imageUrl: dbProject.image_url,
    downloadUrl: dbProject.download_url,
    videoUrl: dbProject.video_url,
    type: dbProject.project_type,
    sortOrder: dbProject.sort_order
  };
}

export function transformDatabaseExperience(dbExperience: DatabaseExperience) {
  return {
    title: dbExperience.title,
    company: dbExperience.company,
    period: dbExperience.period,
    description: dbExperience.description
  };
}

export function transformDatabaseTestimonial(dbTestimonial: DatabaseTestimonial) {
  return {
    name: dbTestimonial.name,
    occupation: dbTestimonial.occupation,
    text: dbTestimonial.text
  };
}