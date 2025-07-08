// API endpoints for Supabase integration
import { supabase } from './supabase';
import { DatabaseProject, DatabaseExperience, DatabaseTestimonial, DatabaseSkill, DatabaseTechStack, DatabaseFunFact, DatabaseProfile, transformDatabaseProject, transformDatabaseExperience, transformDatabaseTestimonial } from '../types/database';

// Profile API
export const profileApi = {
  async getProfile() {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(updates: any) {
    const { data, error } = await supabase
      .from('profile')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Projects API
export const projectsApi = {
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('sort_order');
    
    if (error) throw error;
    return data?.map(transformDatabaseProject) || [];
  },

  async getFeaturedProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'active')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  async getProjectById(id: number) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Experiences API
export const experiencesApi = {
  async getAllExperiences() {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }
};

// Testimonials API
export const testimonialsApi = {
  async getAllTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  async getFeaturedTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }
};

// Skills API
export const skillsApi = {
  async getAllSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }
};

// Tech Stack API
export const techStackApi = {
  async getVisibleTechStack() {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }
};

// Fun Facts API
export const funFactsApi = {
  async getActiveFunFacts() {
    const { data, error } = await supabase
      .from('fun_facts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  async getRandomFunFact() {
    const { data, error } = await supabase
      .from('fun_facts')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }
};

// Contacts API
export const contactsApi = {
  async createContact(contactData: any) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
