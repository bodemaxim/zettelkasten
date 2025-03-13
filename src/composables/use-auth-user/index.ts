import { ref } from "vue";
import { supabase } from "@/api/supabaseClient";
import type { User } from "@supabase/supabase-js";

const user = ref<User | null>(null); //TODO: уточнить разницу между помещением юзера внутри и вне фукнции.

export default function useAuthUser() {
  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) return;

    user.value = data.user;
    console.debug("user", user)
  };


  const getUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser()

    return user;
  }

  return {
    user,
    signIn,
    getUser,
  };
}