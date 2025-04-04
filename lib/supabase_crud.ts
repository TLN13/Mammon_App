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

export const PayPeriodService = {
  async getOrCreateCurrentPayPeriod(userId: string): Promise<string> {
    // First try to find an existing current pay period
    const { data: existing, error: findError } = await supabase
      .from('budget')
      .select('payperiod_id')
      .eq('user_id', userId)
      .gte('payperiod_end', new Date().toISOString())
      .lte('payperiod_start', new Date().toISOString())
      .single();

    if (!findError && existing) {
      return existing.payperiod_id;
    }

    // If none exists, create a new one
    const { data: newPayPeriod, error: createError } = await supabase
      .from('budget')
      .insert([{
        user_id: userId,
        payperiod_start: new Date().toISOString(),
        payperiod_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        budgetlimit: 0,
        budgetbalance: 0,
        setaside: 0,
        savingsgoal: 0
      }])
      .select('payperiod_id')
      .single();

    if (createError) throw createError;
    return newPayPeriod.payperiod_id;
  }
};

export const PurchaseHistoryService = {
  // Create a new purchase record
  async createPurchase(
    user_id: string,
    payperiod_id: string,
    purchasedate: string,
    expense: number,
    description: string
  ) {
    const { data, error } = await supabase
      .from('purchase_history')
      .insert([
        {
          user_id,
          payperiod_id,
          purchasedate,
          expense,
          description,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }

    return data?.[0];
  },

  // Get all purchases for a user
  async getUserPurchases(user_id: string) {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', user_id)
        .order('purchasedate', { ascending: false });  
  
      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }
  
      return data;
    },

  // Update a purchase
  async updatePurchase(
    purchase_id: string,
    updates: {
      purchasedate?: string;
      expense?: number;
      description?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('purchase_history')
      .update(updates)
      .eq('purchase_id', purchase_id)
      .select();

    if (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }

    return data?.[0];
  },

  // Delete a purchase
  async deletePurchase(purchase_id: string) {
    const { error } = await supabase
      .from('purchase_history')
      .delete()
      .eq('purchase_id', purchase_id);

    if (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }

    return true;
  },
  async getUserPurchasesByDateRange(
    user_id: string,
    startDate: string,
    endDate: string
  ) {
    const { data, error } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('user_id', user_id)
      .gte('purchasedate', startDate)
      .lte('purchasedate', endDate)
      .order('purchasedate', { ascending: false });
  
    if (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  
    return data;
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