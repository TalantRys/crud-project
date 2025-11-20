import { useState } from 'react';
import Navigation from './components/Navigation';
import BuyersPage from './components/BuyersPage';
import ProductsPage from './components/ProductsPage';
import OrdersPage from './components/OrdersPage';
import OrdersProductsPage from './components/OrdersProductsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('buyers');

  const renderPage = () => {
    switch (currentPage) {
      case 'buyers':
        return <BuyersPage />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'orders-products':
        return <OrdersProductsPage />;
      default:
        return <BuyersPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">База данных магазина продажи компьютерной техники</h1>
        </div>
      </header>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
