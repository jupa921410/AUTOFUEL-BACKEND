export type Category = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type ProductSize = {
    id: number;
    product_id: number;
    label: string;
    price: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type Product = {
    id: number;
    category_id: number;
    category?: Category;
    name: string;
    description: string | null;
    price: string;
    image: string | null;
    featured: boolean;
    sizes?: ProductSize[];
    created_at: string;
    updated_at: string;
};

export type PromotionGroup = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    promotions_count?: number;
    created_at: string;
    updated_at: string;
};

export type Promotion = {
    id: number;
    promotion_group_id: number | null;
    group?: PromotionGroup;
    title: string;
    description: string | null;
    discount_percentage: string;
    start_date: string;
    end_date: string;
    active: boolean;
    image: string | null;
    media_type: 'image' | 'video';
    youtube_id: string | null;
    text_position: string;
    created_at: string;
    updated_at: string;
};

export type TvStream = {
    id: number;
    name: string;
    slug: string;
    youtube_url: string;
    promotion_group_id: number | null;
    group?: PromotionGroup;
    active: boolean;
    ad_interval_seconds: number;
    ad_count: number;
    pause_on_ads: boolean;
    created_at: string;
    updated_at: string;
};

export type AccountingCategory = {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
    transactions_count?: number;
    created_at: string;
    updated_at: string;
};

export type Transaction = {
    id: number;
    accounting_category_id: number | null;
    category?: AccountingCategory;
    type: 'income' | 'expense';
    amount: string;
    description: string | null;
    date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type Post = {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    excerpt: string | null;
    image: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Schedule = {
    id: number;
    day: string;
    init: string | null;
    end: string | null;
    closed: boolean;
    created_at: string;
    updated_at: string;
};
