// filepath: /C:/Users/Pokel/OneDrive/Documents/SAIT/SEMESTER 3 WINTER 2025/CPRG303 Mobile/Mammon/Mammon_App/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    process.env.EXPO_PUBLIC_SUPABASE_KEY as string
);

export default supabase;