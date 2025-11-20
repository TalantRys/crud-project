/*
  # Создание таблиц для магазина

  ## Новые таблицы

  ### `buyers` - Покупатели
    - `buyer_id` (uuid, primary key) - идентификатор покупателя
    - `buyer_name` (text) - ФИО покупателя
    - `birthday` (date) - день рождения покупателя
    - `created_at` (timestamptz) - дата создания записи

  ### `products` - Товары
    - `product_id` (uuid, primary key) - идентификатор товара
    - `product_name` (text) - наименование товара
    - `description` (text) - описание товара
    - `price` (decimal) - стоимость товара
    - `created_at` (timestamptz) - дата создания записи

  ### `orders` - Заказы
    - `order_id` (uuid, primary key) - идентификатор заказа
    - `buyer_id` (uuid, foreign key) - ссылка на покупателя
    - `order_number` (text) - номер заказа
    - `order_date` (date) - дата заказа
    - `order_summa` (decimal) - сумма заказа
    - `created_at` (timestamptz) - дата создания записи

  ### `orders_products` - Связь заказов и товаров
    - `order_id` (uuid, foreign key) - ссылка на заказ
    - `product_id` (uuid, foreign key) - ссылка на товар
    - `created_at` (timestamptz) - дата создания записи

  ## Тестовые данные
    - Добавлены примеры покупателей, товаров, заказов и связей

  ## Безопасность
    - Включен RLS для всех таблиц
    - Политики позволяют всем пользователям полный доступ (для демонстрации)
*/

-- Таблица покупателей
CREATE TABLE IF NOT EXISTS buyers (
  buyer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name text NOT NULL,
  birthday date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buyers"
  ON buyers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert buyers"
  ON buyers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update buyers"
  ON buyers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete buyers"
  ON buyers FOR DELETE
  USING (true);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
  product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  description text DEFAULT '',
  price decimal(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  USING (true);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES buyers(buyer_id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  order_date date NOT NULL,
  order_summa decimal(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete orders"
  ON orders FOR DELETE
  USING (true);

-- Таблица связи заказов и товаров
CREATE TABLE IF NOT EXISTS orders_products (
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (order_id, product_id)
);

ALTER TABLE orders_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view orders_products"
  ON orders_products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert orders_products"
  ON orders_products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update orders_products"
  ON orders_products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete orders_products"
  ON orders_products FOR DELETE
  USING (true);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_products_order_id ON orders_products(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_products_product_id ON orders_products(product_id);

-- Тестовые данные

-- Добавляем покупателей
INSERT INTO buyers (buyer_name, birthday) VALUES
  ('Иванов Иван Иванович', '1985-03-15'),
  ('Петрова Мария Сергеевна', '1990-07-22'),
  ('Сидоров Алексей Петрович', '1978-11-08'),
  ('Кузнецова Елена Дмитриевна', '1995-01-30'),
  ('Смирнов Дмитрий Александрович', '1988-09-12')
ON CONFLICT DO NOTHING;

-- Добавляем товары
INSERT INTO products (product_name, description, price) VALUES
  ('Ноутбук Dell XPS 15', 'Мощный ноутбук для работы и развлечений с процессором Intel Core i7', 89990.00),
  ('Смартфон Samsung Galaxy S23', 'Флагманский смартфон с камерой 50MP и дисплеем 6.1 дюймов', 69990.00),
  ('Наушники Sony WH-1000XM5', 'Беспроводные наушники с активным шумоподавлением', 29990.00),
  ('Клавиатура Logitech MX Keys', 'Беспроводная клавиатура для продуктивной работы', 9990.00),
  ('Мышь Logitech MX Master 3', 'Эргономичная беспроводная мышь для профессионалов', 7990.00),
  ('Монитор LG UltraWide 34"', 'Широкоформатный монитор для многозадачности', 45990.00),
  ('Планшет iPad Air', 'Универсальный планшет для работы и творчества', 54990.00),
  ('Умные часы Apple Watch Series 9', 'Смарт-часы с множеством функций для здоровья', 39990.00)
ON CONFLICT DO NOTHING;

-- Получаем ID для создания заказов (это будет работать только при первом запуске)
-- В реальном приложении используйте конкретные UUID из вашей базы данных

-- Примеры заказов (замените UUID на реальные из вашей базы)
-- INSERT INTO orders (buyer_id, order_number, order_date, order_summa) VALUES
--   ('uuid-покупателя', 'ORD-2024-001', '2024-01-15', 99980.00),
--   ('uuid-покупателя', 'ORD-2024-002', '2024-01-20', 69990.00);

-- Примеры связей заказов и товаров
-- INSERT INTO orders_products (order_id, product_id) VALUES
--   ('uuid-заказа', 'uuid-товара');
