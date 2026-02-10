
import { supabase } from "@/lib/supabase";

export const uploadImage = async (file: File, bucket: string = 'auctions'): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
};
