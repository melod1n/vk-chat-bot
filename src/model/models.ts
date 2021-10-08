class VkPhoto {
    album_id: number;
    date: number;
    id: number;
    owner_id: number;
    has_tags: boolean;
    access_key?: string;
    sizes: VkPhotoSize[];
    text: string;
    user_id?: number;

    lat?: number;
    lon?: number;
}

class VkPhotoSize {
    width: number;
    height: number;
    type: string;
    url: string;
}


