/** Фото в старых сообщениях чата (markdown-картинка): показываем их отдельно от текста */
const PHOTO = /!\[[^\]]*\]\(((?:https:\/\/|\/(?!\/))[^)\s]+)\)/g;

export function splitPhotos(content: string): { text: string; photos: string[] } {
  const photos = [...content.matchAll(PHOTO)].map((match) => match[1]);
  return { text: content.replace(PHOTO, "").trim(), photos };
}
