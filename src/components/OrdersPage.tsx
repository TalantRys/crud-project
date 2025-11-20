import { useState, useEffect } from 'react';
import { supabase, Order, Buyer } from '../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface OrderWithBuyer extends Order {
  buyer?: Buyer;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithBuyer[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    buyer_id: '',
    order_number: '',
    order_date: '',
    order_summa: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResult, buyersResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*, buyers(*)')
          .order('created_at', { ascending: false }),
        supabase.from('buyers').select('*').order('buyer_name'),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (buyersResult.error) throw buyersResult.error;

      // Supabase returns related rows under the relation table name ("buyers").
      // Map each order to include a single `buyer` object for easier access in the UI.
      const ordersWithBuyer: OrderWithBuyer[] = (ordersResult.data || []).map(
        (o: any) => ({ ...o, buyer: Array.isArray(o.buyers) ? o.buyers[0] : o.buyers })
      );
      setOrders(ordersWithBuyer);
      setBuyers(buyersResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        buyer_id: formData.buyer_id,
        order_number: formData.order_number,
        order_date: formData.order_date,
        order_summa: parseFloat(formData.order_summa),
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('orders')
          .update(dataToSave)
          .eq('order_id', editingOrder.order_id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('orders').insert([dataToSave]);

        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('order_id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const openModal = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        buyer_id: order.buyer_id,
        order_number: order.order_number,
        order_date: order.order_date,
        order_summa: order.order_summa.toString(),
      });
    } else {
      setEditingOrder(null);
      setFormData({ buyer_id: '', order_number: '', order_date: '', order_summa: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setFormData({ buyer_id: '', order_number: '', order_date: '', order_summa: '' });
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
        <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить заказ
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
                Дата заказа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.buyer?.buyer_name || 'Неизвестно'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.order_summa.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openModal(order)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(order.order_id)}
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
              <h2 className="text-xl font-bold text-gray-900">
                {editingOrder ? 'Редактировать заказ' : 'Добавить заказ'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Покупатель
                </label>
                <select
                  value={formData.buyer_id}
                  onChange={(e) => setFormData({ ...formData, buyer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Выберите покупателя</option>
                  {buyers.map((buyer) => (
                    <option key={buyer.buyer_id} value={buyer.buyer_id}>
                      {buyer.buyer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер заказа
                </label>
                <input
                  type="text"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата заказа
                </label>
                <input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.order_summa}
                  onChange={(e) => setFormData({ ...formData, order_summa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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
                  {editingOrder ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
