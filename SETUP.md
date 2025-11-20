# Инструкция по настройке проекта

## 1. Настройка базы данных Supabase

### Создание таблиц

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в раздел **SQL Editor**
3. Скопируйте и выполните SQL-скрипт из файла `database_setup.sql`

Этот скрипт создаст:
- Таблицу `buyers` (покупатели)
- Таблицу `products` (товары)
- Таблицу `orders` (заказы)
- Таблицу `orders_products` (связи заказов и товаров)
- Политики безопасности RLS для всех таблиц
- Тестовые данные для демонстрации

### Альтернативный вариант (MySQL)

Если вы хотите использовать MySQL вместо Supabase PostgreSQL, вот эквивалентный SQL-скрипт:

```sql
-- Таблица покупателей
CREATE TABLE IF NOT EXISTS buyers (
  buyer_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  buyer_name VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
  product_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  buyer_id VARCHAR(36) NOT NULL,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  order_date DATE NOT NULL,
  order_summa DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(buyer_id) ON DELETE CASCADE
);

-- Таблица связи заказов и товаров
CREATE TABLE IF NOT EXISTS orders_products (
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_products_order_id ON orders_products(order_id);
CREATE INDEX idx_orders_products_product_id ON orders_products(product_id);

-- Тестовые данные
INSERT INTO buyers (buyer_name, birthday) VALUES
  ('Иванов Иван Иванович', '1985-03-15'),
  ('Петрова Мария Сергеевна', '1990-07-22'),
  ('Сидоров Алексей Петрович', '1978-11-08'),
  ('Кузнецова Елена Дмитриевна', '1995-01-30'),
  ('Смирнов Дмитрий Александрович', '1988-09-12');

INSERT INTO products (product_name, description, price) VALUES
  ('Ноутбук Dell XPS 15', 'Мощный ноутбук для работы и развлечений', 89990.00),
  ('Смартфон Samsung Galaxy S23', 'Флагманский смартфон с камерой 50MP', 69990.00),
  ('Наушники Sony WH-1000XM5', 'Беспроводные наушники с активным шумоподавлением', 29990.00),
  ('Клавиатура Logitech MX Keys', 'Беспроводная клавиатура для продуктивной работы', 9990.00),
  ('Мышь Logitech MX Master 3', 'Эргономичная беспроводная мышь', 7990.00),
  ('Монитор LG UltraWide 34"', 'Широкоформатный монитор для многозадачности', 45990.00),
  ('Планшет iPad Air', 'Универсальный планшет для работы и творчества', 54990.00),
  ('Умные часы Apple Watch Series 9', 'Смарт-часы с функциями для здоровья', 39990.00);
```

**Примечание**: Для MySQL потребуется изменить код приложения для работы с другой базой данных.

## 2. Настройка переменных окружения

1. Найдите файл `.env` в корне проекта
2. Откройте Supabase Dashboard → Settings → API
3. Скопируйте значения:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

Файл `.env` должен выглядеть так:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Установка зависимостей

```bash
npm install
```

## 4. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Структура приложения

### Страницы

- **Покупатели** - управление списком покупателей (CRUD)
- **Товары** - управление каталогом товаров (CRUD)
- **Заказы** - управление заказами (CRUD)
- **Связи** - управление связями между заказами и товарами (CRUD)

### Функциональность

Каждая страница поддерживает:
- **Create** - Добавление новой записи через модальное окно
- **Read** - Просмотр всех записей в таблице
- **Update** - Редактирование записи через модальное окно
- **Delete** - Удаление записи с подтверждением

### Особенности

- Все операции выполняются в реальном времени
- Данные автоматически обновляются после каждой операции
- Внешние ключи обеспечивают целостность данных
- RLS политики защищают данные на уровне базы данных
- Адаптивный дизайн для всех размеров экранов
- Интуитивный интерфейс с иконками
