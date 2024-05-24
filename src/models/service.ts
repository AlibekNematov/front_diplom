export interface Service {
    id: number;
    title: string;
    is_group: number;
    duration: number;
    club_id: number;
    description: string;
    image_url: string;
    price: number;
    employees: any[];
    club_title?: string;
}
