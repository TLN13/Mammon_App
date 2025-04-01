// src/lib/supabase/supabase.crud.ts
import { supabase } from './supabase';

// User CRUD Operations
export const UserService = {
  // Create a new user in user_details table
  async createUserProfile(
    user_id: string,
    firstName: string,
    lastName: string,
    dob: string,
    email: string,
  ) {
    const { data, error } = await supabase
      .from('user_details')
      .insert([
        {
          user_id: user_id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          email: email,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    return data?.[0];
  },

  // Get user profile by ID
  async getUserProfile(user_id: string) {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    return data;
  },

  // Update user profile
  async updateUserProfile(
    user_id: string,
    updates: {
      first_name?: string;
      last_name?: string;
      email?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('user_details')
      .update(updates)
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return data?.[0];
  },

  async deleteUserProfile(user_id: string) {
    const { error } = await supabase
      .from('user_details')
      .delete()
      .eq('user_id', user_id);

    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }

    return true;
  },
};

  // Auth Operations
  export const AuthService = {
    async signUpWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dob: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    if (data.user) {
      await UserService.createUserProfile(data.user.id, firstName, lastName, dob, email);
    }

    return data;
  },


  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }

    return true;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }

    return data.user;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }

    return data.session;
  },
};