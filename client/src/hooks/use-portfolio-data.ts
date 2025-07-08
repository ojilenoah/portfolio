// React Query hooks for data fetching with Supabase
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { transformDatabaseProject, transformDatabaseExperience, transformDatabaseTestimonial } from '@/types/database';

// Profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 1, // Reduce cache time to 1 minute for faster updates
  });
};

// Projects hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data?.map(transformDatabaseProject) || [];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

export const useFeaturedProjects = () => {
  return useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data?.map(transformDatabaseProject) || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data ? transformDatabaseProject(data) : null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Experiences hooks
export const useExperiences = () => {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data?.map(transformDatabaseExperience) || [];
    },
    staleTime: 1000 * 60 * 1, // Reduce cache time to 1 minute for faster updates
  });
};

// Testimonials hooks
export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data?.map(transformDatabaseTestimonial) || [];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

// Skills hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};

// Tech Stack hooks
export const useTechStack = () => {
  return useQuery({
    queryKey: ['tech-stack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_stack')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// Fun Facts hooks
export const useFunFacts = () => {
  return useQuery({
    queryKey: ['fun-facts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useRandomFunFact = () => {
  return useQuery({
    queryKey: ['fun-facts', 'random'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      // Return random fact
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
  });
};

// Contact mutation
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactData: any) => {
      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
