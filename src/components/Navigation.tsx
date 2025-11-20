import { Users, Package, ShoppingCart, Link as LinkIcon } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const pages = [
    { id: 'buyers', name: 'Покупатели', icon: Users },
    { id: 'products', name: 'Товары', icon: Package },
    { id: 'orders', name: 'Заказы', icon: ShoppingCart },
    { id: 'orders-products', name: 'Связи', icon: LinkIcon },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-16">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {page.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
