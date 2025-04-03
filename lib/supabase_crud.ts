import { supabase } from "./supabase";




export const UserService = {
    async createUserProfile(
        uuid: string,
        first_name: string,
        last_name: string,
        email: string,
        dob: string,
        password: string
    ){
        const {data, error} = await supabase
        .from ("userDetails")
        .insert([
            {
                uuid: uuid,
                first_name: first_name,
                last_name: last_name,
                email: email,
                dob: dob,
                password: password

            },
        ])
        .select();

        if(error){
            console.error('Error creating user profile:', error)
            throw error;
        }
        return data?.[0];
    },
    async getUserProfile(uuid: string){
        const {data, error} = await supabase
        .from('userDetails')
        .select('*')
        .eq('uuid', uuid)
        .single();

        if (error){
            console.error('Error fetching user data', error);
            throw error;
        }
        return data;
    },
    async updateUserData(
        uuid: string,
        updates:{
            first_name?: string,
            last_name?: string,
            email?: string,
            password?: string
        }
    ){
        const { data, error } = await supabase
      .from('userDetails')
      .update(updates)
      .eq('uuid', uuid)
      .select();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    return data?.[0];
    },
    async deleteUserProfile(uuid: string) {
        const { error } = await supabase
          .from('userDetails')
          .delete()
          .eq('uuid', uuid);
    
        if (error) {
          console.error('Error deleting user profile:', error);
          throw error;
        }
    
        return true;
      }
<<<<<<< Updated upstream
};
      export const authService = {
        async signUpWithEmail(
            first_name: string,
            last_name: string,
            email: string,
            dob: string,
            password: string
        ){
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
              });
=======
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
  
>>>>>>> Stashed changes

            if (error) {
                console.error('Error signing up:', error);
                throw error;
            }
            if (data.user) {
                // Create user profile in user_details table
                await UserService.createUserProfile(
                  data.user.id,
                  first_name,
                  last_name,
                  email,
                  dob,
                  password
                );
              }
              return data;
        },
        async signInWithEmail(email: string, password: string){
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if(error){
                console.error('Error signing in:', error);
            throw error;
            }
            return data;
        },

        async signOut(){
            const {error} = await supabase.auth.signOut();

<<<<<<< Updated upstream
            if(error){
                console.error('Error signing in:', error);
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
}
=======
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
>>>>>>> Stashed changes
