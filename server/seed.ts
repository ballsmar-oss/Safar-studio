import { portfolioItems, testimonials } from "../drizzle/schema";
import { db } from "./db";

// First start only: fill the site with what the old Manus site showed, so it isn't empty.
export function seedIfEmpty() {
  if (!db.select({ id: portfolioItems.id }).from(portfolioItems).limit(1).get()) {
    db.insert(portfolioItems).values([
      { title: "رابطي", category: "موشن", mediaType: "link", mediaUrl: "https://safarstudio.sa", sortOrder: 1 },
      { title: "صورة ١", category: "موشن", mediaType: "image", mediaUrl: "/media/work-car.jpg", sortOrder: 2 },
      { title: "فيديو ٢", category: "موشن", mediaType: "video", mediaUrl: "/media/video2.mp4", thumbnailUrl: "/media/video2-poster.jpg", sortOrder: 3 },
      { title: "فيديو ١", category: "موشن", mediaType: "video", mediaUrl: "/media/video1.mp4", thumbnailUrl: "/media/video1-poster.jpg", sortOrder: 4 },
    ]).run();
  }
  if (!db.select({ id: testimonials.id }).from(testimonials).limit(1).get()) {
    db.insert(testimonials).values([
      { name: "هي", company: "بي", quote: "منتازه", rating: 5, sortOrder: 1 },
      { name: "عميل ١", company: "فنان", quote: "رهيب", rating: 5, sortOrder: 2 },
    ]).run();
  }
}
