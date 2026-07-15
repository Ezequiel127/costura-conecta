import { supabase } from '../supabaseClient';

export interface ProfessionalProfileInput {
  name: string;
  phone: string;
  city: string;
  skills: string[];
  availability: string;
  experience: string;
}

export type CreateProfessionalProfileResult =
  | { success: true }
  | { success: false; reason: 'unauthenticated' | 'already_exists' | 'unexpected' };

export async function createProfessionalProfile(
  profile: ProfessionalProfileInput
): Promise<CreateProfessionalProfileResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, reason: 'unauthenticated' };
  }

  if (authError) {
    return { success: false, reason: 'unexpected' };
  }

  const { error } = await supabase.from('professional_profiles').insert({
    user_id: user.id,
    name: profile.name.trim(),
    phone: profile.phone.trim(),
    city: profile.city,
    skills: profile.skills,
    availability: profile.availability,
    experience: profile.experience.trim(),
  });

  if (!error) {
    return { success: true };
  }

  if (error.code === '23505') {
    return { success: false, reason: 'already_exists' };
  }

  return { success: false, reason: 'unexpected' };
}
