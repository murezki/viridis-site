# Viridis — Деплой-гайд

## Структура проекта

```
viridis/
├── index.html              ← без изменений
├── styles.css              ← без изменений
├── script.js               ← ОБНОВЛЁН — загружает данные из JSON
├── logo.png                ← твой логотип
├── slide2-image.png        ← картинка для слайда 2
├── kazakhstan-map.png      ← карта Казахстана
├── uk-map.png              ← карта UK
├── photos/                 ← папка для фото альбома и статей
│   ├── event-01.jpg
│   └── ...
├── data/
│   ├── articles.json       ← статьи журнала
│   ├── album.json          ← фото + подписи альбома
│   ├── founders.json       ← со-основатели
│   └── network.json        ← данные сети по странам
```

---

## Этап 1 — Подготовка файлов

1. Создай папку проекта на компе (например `viridis-site/`)
2. Скопируй туда свой **index.html** и **styles.css** (они не менялись)
3. Замени **script.js** на новый файл из этого пакета
4. Создай внутри папку **data/** и положи туда все 4 JSON-файла
5. Создай папку **photos/** для фото альбома и статей
6. Положи картинки (logo.png, slide2-image.png, карты) в корень рядом с index.html

---

## Этап 2 — Добавление фото в альбом

Открой `data/album.json`. Формат:

```json
[
  {
    "image": "photos/event-01.jpg",
    "title": "Первый митап Viridis",
    "caption": "Наша первая встреча в Алматы, март 2025"
  },
  {
    "image": "photos/event-02.jpg",
    "title": "",
    "caption": "Рабочая сессия по проекту почвы"
  }
]
```

- **image** — путь к фото (относительно index.html). Кидай фото в папку `photos/`
- **title** — заголовок (необязательно, оставь пустую строку `""`)
- **caption** — описание под фото
- Если image = `null` — будет серый плейсхолдер с номером

---

## Этап 3 — Добавление статей

Открой `data/articles.json`. Структура:

```json
{
  "label": "ISSUE 01 — SPRING 2025",
  "articles": [
    {
      "title": "Название статьи",
      "author": "Автор · Школа",
      "date": "March 1, 2026",
      "preview": "Первые 1-2 предложения для превью...",
      "image": null,
      "content": "<p>HTML-контент статьи...</p>"
    }
  ]
}
```

Чтобы добавить новую статью — добавь новый объект в массив `articles`. Контент пишется в HTML:
- Абзацы: `<p>текст</p>`
- Подзаголовки: `<h3>заголовок</h3>`
- Цитаты: `<blockquote>цитата</blockquote>`
- Списки: `<ul class="j-ov-action-list"><li>пункт</li></ul>`
- Ссылки: `<a href="URL" target="_blank">текст</a>`
- Курсив: `<em>текст</em>`

Для картинки статьи: `"image": "photos/article-cover.jpg"` (или `null` для плейсхолдера)

**Важно:** в JSON строках кавычки экранируются: `\"` вместо `"`

---

## Этап 4 — Локальная проверка

JSON загружается через `fetch()`, поэтому нельзя просто открыть index.html двойным кликом — нужен локальный сервер.

**Вариант A — VS Code (самый простой):**
1. Установи расширение **Live Server** в VS Code
2. Открой папку проекта
3. Правый клик на index.html → "Open with Live Server"

**Вариант B — через терминал:**
```bash
cd viridis-site
npx serve .
# или
python3 -m http.server 8000
```
Открой `http://localhost:8000` в браузере.

---

## Этап 5 — Загрузка на GitHub

1. Создай аккаунт на [github.com](https://github.com) (если нет)
2. Создай **новый репозиторий**: имя `viridis-site`, публичный
3. В терминале (в папке проекта):

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/murezki/viridis-site.git
git push -u origin main
```

4. Включи **GitHub Pages**:
   - Settings → Pages → Source: **Deploy from a branch**
   - Branch: `main`, folder: `/ (root)`
   - Save

Через 1-2 минуты сайт будет доступен на `https://ТВОЙ-ЮЗЕРНЕЙМ.github.io/viridis-site/`

---

## Этап 6 — Покупка домена на Namecheap

1. Зайди на [namecheap.com](https://namecheap.com)
2. Найди и купи домен (например `viridis.org` или `viridissociety.com`)
3. После покупки перейди в **Domain List** → кликни на свой домен → **Advanced DNS**

---

## Этап 7 — Привязка домена к GitHub Pages

### В Namecheap (Advanced DNS):

Удали все существующие записи и добавь:

| Type  | Host | Value              | TTL       |
|-------|------|--------------------|-----------|
| A     | @    | 185.199.108.153    | Automatic |
| A     | @    | 185.199.109.153    | Automatic |
| A     | @    | 185.199.110.153    | Automatic |
| A     | @    | 185.199.111.153    | Automatic |
| CNAME | www  | ТВОЙ-ЮЗЕРНЕЙМ.github.io. | Automatic |

### В GitHub:

1. Settings → Pages → Custom domain: введи свой домен (например `viridis.org`)
2. Поставь галочку **Enforce HTTPS**
3. Подожди 5-30 минут пока DNS пропагируется

### Файл CNAME:

GitHub обычно создаёт его автоматически, но если нет — создай файл `CNAME` в корне репозитория с одной строкой:
```
viridis.org
```

---

## Этап 8 — Обновление контента (после деплоя)

Когда хочешь добавить статью или фото:

1. Отредактируй нужный JSON-файл в папке `data/`
2. Если добавляешь фото — кинь файлы в `photos/`
3. Запушь на GitHub:

```bash
git add .
git commit -m "добавлена новая статья"
git push
```

GitHub Pages автоматически обновит сайт за 1-2 минуты.

---

## Альтернатива: Netlify (вместо GitHub Pages)

Если хочешь ещё проще:

1. Зайди на [netlify.com](https://netlify.com), войди через GitHub
2. New site → Import from Git → выбери свой репозиторий
3. Build command: оставь пустым
4. Publish directory: `.` (точка)
5. Deploy

Привязка домена в Netlify:
- Domain settings → Add custom domain → введи домен
- В Namecheap: поменяй DNS nameservers на те, что покажет Netlify

---

## Быстрый чеклист

- [ ] Файлы разложены по структуре
- [ ] JSON-файлы валидны (проверить на jsonlint.com)
- [ ] Картинки на месте (logo.png, slide2-image.png, карты)
- [ ] Локально всё работает через Live Server
- [ ] Репозиторий создан и запушен на GitHub
- [ ] GitHub Pages включён
- [ ] Домен куплен на Namecheap
- [ ] DNS записи настроены
- [ ] HTTPS включён
- [ ] Сайт открывается по кастомному домену
