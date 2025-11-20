import { useState, useEffect } from 'react';
import { supabase, OrderProduct, Order, Product } from '../lib/supabase';
import { Plus, Trash2, X } from 'lucide-react';

interface OrderProductWithDetails extends OrderProduct {
  order?: Order & { buyers?: { buyer_name: string } };
  product?: Product;
}

export default function OrdersProductsPage() {
  const [orderProducts, setOrderProducts] = useState<OrderProductWithDetails[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    product_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderProductsResult, ordersResult, productsResult] = await Promise.all([
        supabase
          .from('orders_products')
          .select('*, orders(*, buyers(buyer_name)), products(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*, buyers(buyer_name)')
          .order('order_number'),
        supabase.from('products').select('*').order('product_name'),
      ]);

      if (orderProductsResult.error) throw orderProductsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      // Normalize relation fields: Supabase returns related rows under
      // the relation table names (`orders`, `products`). Map them to
      // `order` and `product` (single objects) and normalize nested
      // `buyers` to a single object as well for easier rendering.
      const rawOrderProducts = orderProductsResult.data || [];
      const mappedOrderProducts: OrderProductWithDetails[] = rawOrderProducts.map(
        (op: any) => {
          const orderRaw = op.orders;
          const productRaw = op.products;

          let orderMapped: any = undefined;
          if (orderRaw) {
            orderMapped = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
            if (orderMapped && Array.isArray(orderMapped.buyers)) {
              orderMapped.buyers = orderMapped.buyers[0];
            }
          }

          const productMapped = productRaw ? (Array.isArray(productRaw) ? productRaw[0] : productRaw) : undefined;

          return { ...op, order: orderMapped, product: productMapped };
        }
      );

      setOrderProducts(mappedOrderProducts);
      setOrders(ordersResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('orders_products').insert([formData]);

      if (error) throw error;

      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving order-product:', error);
      alert('Ошибка при сохранении. Возможно, эта связь уже существует.');
    }
  };

  const handleDelete = async (orderId: string, productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту связь?')) return;

    try {
      const { error } = await supabase
        .from('orders_products')
        .delete()
        .eq('order_id', orderId)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting order-product:', error);
    }
  };

  const openModal = () => {
    setFormData({ order_id: '', product_id: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ order_id: '', product_id: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Связи заказов и товаров</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить связь
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер заказа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Покупатель
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена товара
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderProducts.map((op) => (
              <tr key={`${op.order_id}-${op.product_id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {op.order?.order_number || 'Неизвестно'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {op.order?.buyers?.buyer_name || 'Неизвестно'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {op.product?.product_name || 'Неизвестно'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {op.product?.price
                    ? op.product.price.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(op.order_id, op.product_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Добавить связь</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заказ
                </label>
                <select
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Выберите заказ</option>
                  {orders.map((order) => (
                    <option key={order.order_id} value={order.order_id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Товар
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Выберите товар</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name} - {product.price.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
