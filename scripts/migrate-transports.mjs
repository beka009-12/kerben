// Перенос машин (транспорта) со старого backend на новый.
// Запуск: node scripts/migrate-transports.mjs           — только показать, что будет перенесено
//         node scripts/migrate-transports.mjs --yes     — перенести
// Логин и пароль админа каждого сервера скрипт спрашивает сам; они никуда не сохраняются.
// Машины, которые на новом сервере уже есть (то же название), пропускаются — повторный запуск безопасен.
import { createInterface } from "node:readline";

const OLD = (process.env.OLD_API_URL || "https://13.53.40.37").replace(/\/+$/, "");
const NEW = (process.env.NEW_API_URL || "https://13.49.104.87").replace(/\/+$/, "");
const WRITE = process.argv.includes("--yes");

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Пароль не печатается на экране
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function api(base, path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)?.slice(0, 200)}`);
  return data;
}

async function login(base, label) {
  console.log(`\nВход в админку ${label} (${base})`);
  const username = await ask("  логин: ");
  const password = await ask("  пароль: ", true);
  const data = await api(base, "/admin/login/", { method: "POST", body: { username, password } });
  if (!data?.access_token) throw new Error(`${label}: нет токена в ответе`);
  return data.access_token;
}

const FIELDS = ["name", "brand", "model", "color", "year", "seats", "description", "price", "price_unit", "has_driver", "has_air_conditioner", "main_image", "is_active"];

async function main() {
  const oldToken = await login(OLD, "старого сервера");
  const cards = await api(OLD, "/transports/?limit=100");
  console.log(`\nНа старом сервере машин: ${cards.length}`);

  // Подробности и галерея нужны с токеном; если сервер их не отдаст — берём то, что есть в списке
  let images = [];
  try {
    images = await api(OLD, "/transport-images/?limit=100", { token: oldToken });
  } catch (error) {
    console.warn(`  галерея недоступна, переносим только главное фото: ${error.message}`);
  }
  const cars = [];
  for (const card of cards) {
    let detail = card;
    try {
      detail = { ...card, ...(await api(OLD, `/transports/${card.id}/?lang=ru`, { token: oldToken })) };
    } catch (error) {
      console.warn(`  #${card.id}: подробности недоступны (${error.message}), переносим из списка`);
    }
    const input = Object.fromEntries(FIELDS.filter((key) => detail[key] !== undefined).map((key) => [key, detail[key]]));
    const gallery = images.filter((img) => img.transport_id === card.id).sort((a, b) => a.order - b.order);
    cars.push({ oldId: card.id, input, gallery });
  }

  const newToken = await login(NEW, "нового сервера");
  const existing = new Set((await api(NEW, "/transports/?limit=100")).map((t) => t.name.trim().toLowerCase()));

  console.log("");
  for (const car of cars) {
    const skip = existing.has(car.input.name.trim().toLowerCase());
    console.log(`${skip ? "пропуск (уже есть)" : WRITE ? "переношу" : "будет перенесено"}: #${car.oldId} ${car.input.name} · фото в галерее: ${car.gallery.length}`);
    if (skip || !WRITE) continue;
    const created = await api(NEW, "/transports/", { token: newToken, method: "POST", body: car.input });
    for (const img of car.gallery) {
      await api(NEW, "/transport-images/", { token: newToken, method: "POST", body: { transport_id: created.id, image: img.image, order: img.order } });
    }
    console.log(`  готово: новый id ${created.id}`);
  }
  if (!WRITE) console.log("\nЭто была проверка. Чтобы перенести, запустите с флагом --yes");
}

main().catch((error) => {
  console.error(`\nОшибка: ${error.message}`);
  process.exit(1);
});
