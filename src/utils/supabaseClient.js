import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Saved Looks
export const saveLook = async (lookData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not logged in')

    const { data, error } = await supabase
        .from('saved_looks')
        .insert([{ user_id: user.id, ...lookData }])
        .select()

    if (error) throw error
    return data[0]
}

export const getSavedLooks = async () => {
    const { data, error } = await supabase
        .from('saved_looks')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

// History
export const addHistory = async (productData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not logged in')

    const { data, error } = await supabase
        .from('user_history')
        .insert([{ user_id: user.id, product_data: productData }])
        .select()

    if (error) throw error
    return data[0]
}

export const getHistory = async () => {
    const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) throw error
    return data
}
