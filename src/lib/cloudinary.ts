const BASE = "https://res.cloudinary.com/dxjumiu7d/image/upload/";

/** URL optimisée d'une capture Cloudinary. Les GIF animés sont servis tels quels. */
export const shotUrl = (id: string, width: number) =>
  BASE + (/\.gif$/.test(id) ? "" : `f_auto,q_auto,w_${width}/`) + id;
