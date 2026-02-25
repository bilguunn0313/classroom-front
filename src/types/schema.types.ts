export interface Subject {
  id: number;
  description: string | null;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface Course {
  id: number;
  description: string | null;
  title: string;
  subject_id: number;
  user_id: number;
  thumbnail_url: string;
  views: number;
  published: boolean;
  created_at: string;
  updated_at?: string;
  // joined data
  user_name?: string;
  subject_name?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string | null;
  course_id: number;
  lesson_order: number;
  video_url: string | null;
  video_duration: number | null;
  published: boolean;
  created_at: string;
  updated_at?: string;
  text: string | null;
}

export interface MenuItem {
  id: number;
  daily_menu_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  item_type: "meal_1" | "meal_2" | "drink";
  created_at: string;
  updated_at: string;
}

export interface DailyMenu {
  id: number;
  menu_date: string;
  created_by: number;
  created_by_name?: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: MenuItem[];
}
