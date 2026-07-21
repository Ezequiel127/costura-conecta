import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export interface CompanyProfileInput {
  name: string;
  phone: string;
  city: string;
  business_type: string;
  email: string;
  address: string;
  description: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  business_type: string;
  email: string | null;
  address: string | null;
  description: string | null;
}

type CompanyProfileFailureReason = 'unauthenticated' | 'already_exists' | 'unexpected';

export type GetCurrentCompanyProfileResult =
  | { success: true; profile: CompanyProfile | null }
  | { success: false; reason: Exclude<CompanyProfileFailureReason, 'already_exists'> };

export type CreateCompanyProfileResult =
  | { success: true }
  | { success: false; reason: CompanyProfileFailureReason };

type CurrentUserResult =
  | { success: true; user: User }
  | { success: false; reason: 'unauthenticated' | 'unexpected' };

async function getCurrentUser(): Promise<CurrentUserResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      success: false,
      reason: error.name === 'AuthSessionMissingError' ? 'unauthenticated' : 'unexpected',
    };
  }

  if (!user) {
    return { success: false, reason: 'unauthenticated' };
  }

  return { success: true, user };
}

export async function getCurrentCompanyProfile(): Promise<GetCurrentCompanyProfileResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser.success) {
      return currentUser;
    }

    const { data, error } = await supabase
      .from('company_profiles')
      .select('id, name, phone, city, business_type, email, address, description')
      .eq('user_id', currentUser.user.id)
      .maybeSingle();

    if (error) {
      return { success: false, reason: 'unexpected' };
    }

    return { success: true, profile: data as CompanyProfile | null };
  } catch {
    return { success: false, reason: 'unexpected' };
  }
}

export async function createCompanyProfile(
  profile: CompanyProfileInput
): Promise<CreateCompanyProfileResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser.success) {
      return currentUser;
    }

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', currentUser.user.id)
      .maybeSingle();

    if (existingProfileError) {
      return { success: false, reason: 'unexpected' };
    }

    if (existingProfile) {
      return { success: false, reason: 'already_exists' };
    }

    const name = profile.name.trim();
    const phone = profile.phone.trim();
    const city = profile.city.trim();
    const businessType = profile.business_type.trim();
    const email = profile.email.trim();
    const address = profile.address.trim();
    const description = profile.description.trim();

    const { error } = await supabase.from('company_profiles').insert({
      user_id: currentUser.user.id,
      name,
      phone,
      city,
      business_type: businessType,
      email: email || null,
      address: address || null,
      description: description || null,
    });

    if (!error) {
      return { success: true };
    }

    if (error.code === '23505') {
      return { success: false, reason: 'already_exists' };
    }

    return { success: false, reason: 'unexpected' };
  } catch {
    return { success: false, reason: 'unexpected' };
  }
}
