import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Type Definitions ---
export type DietTag = 'veg' | 'non_veg' | 'egg';
export type TableSection = 'indoor' | 'outdoor' | 'bbq';
export type TableStatus = 'vacant' | 'occupied' | 'dirty' | 'reserved';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type ItemStatus = 'new' | 'preparing' | 'ready' | 'served';
export type PaymentStatus = 'pending' | 'captured' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'counter_cash' | 'counter_card';
export type AlertType = 'water' | 'napkins' | 'bill' | 'waiter';
export type AlertStatus = 'unacknowledged' | 'acknowledged' | 'resolved';

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  diet: DietTag;
  allergens: string[];
  spiceLevel: number; // 0 to 3 chilies
  prepTimeMinutes: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface DiningTable {
  id: string;
  tableNumber: number;
  section: TableSection;
  seatingCapacity: number;
  status: TableStatus;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  spiceLevel: number;
  customNotes: string;
}

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  spiceLevel: number;
  status: ItemStatus;
  kitchenNotes: string;
}

export interface OrderRecord {
  id: string;
  tableId: string;
  tableNumber: number;
  orderSequenceNumber: string;
  status: OrderStatus;
  items: OrderItemRecord[];
  notes: string;
  createdTime: Date;
  updatedTime: Date;
}

export interface StaffAlert {
  id: string;
  tableId: string;
  tableNumber: number;
  alertType: AlertType;
  status: AlertStatus;
  createdTime: Date;
}

export interface BillRecord {
  id: string;
  tableId: string;
  tableNumber: number;
  billNumber: string;
  subtotal: number;
  discount: number;
  cgst: number; // 2.5%
  sgst: number; // 2.5%
  tip: number;
  grandTotal: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdTime: Date;
  completedTime?: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  actionType: string;
  details: string;
  userRole: string;
}

interface AppContextType {
  tables: DiningTable[];
  menuItems: MenuItem[];
  orders: OrderRecord[];
  alerts: StaffAlert[];
  bills: BillRecord[];
  auditLogs: AuditLog[];
  activeTableId: string;
  setActiveTableId: (id: string) => void;
  // Actions
  placeOrder: (tableId: string, items: CartItem[], notes: string) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleItemAvailability: (itemId: string) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  addStaffAlert: (tableId: string, alertType: AlertType) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  processPayment: (tableId: string, method: PaymentMethod, tip: number) => void;
  cleanTable: (tableId: string) => void;
  triggerCleanRequest: (tableId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Mock Initial Data ---
const INITIAL_MENU: MenuItem[] = [
  // Soups
  { id: 'm1', category: 'Soup', name: 'Nattu Kozhi Soup', description: 'Traditional Tamil-style country chicken soup with crushed pepper and native spices.', price: 160, diet: 'non_veg', allergens: [], spiceLevel: 3, prepTimeMinutes: 10, isAvailable: true, imageUrl: './images/nattu_kozhi_soup.png' },
  { id: 'm2', category: 'Soup', name: 'Sweet Corn Veg Soup', description: 'Creamy sweet corn kernels in a seasoned vegetable stock broth.', price: 120, diet: 'veg', allergens: [], spiceLevel: 0, prepTimeMinutes: 10, isAvailable: true, imageUrl: './images/sweet_corn_soup.png' },
  
  // Starters
  { id: 'm3', category: 'Starters', name: 'Chicken 65 (Dry)', description: 'Crispy deep-fried chicken cubes tossed in ginger, garlic, and hot spices.', price: 210, diet: 'non_veg', allergens: ['egg'], spiceLevel: 2, prepTimeMinutes: 15, isAvailable: true, imageUrl: './images/chicken_65.png' },
  { id: 'm4', category: 'Starters', name: 'Gobi Kempu', description: 'Crispy cauliflower florets coated in spice blend and yogurt glaze.', price: 150, diet: 'veg', allergens: ['dairy'], spiceLevel: 2, prepTimeMinutes: 15, isAvailable: true, imageUrl: './images/gobi_kempu.png' },
  { id: 'm5', category: 'Starters', name: 'BBQ Paneer Tikka', description: 'Clay-oven grilled paneer cubes marinated in yogurt, mustard oil, and spices.', price: 240, diet: 'veg', allergens: ['dairy'], spiceLevel: 1, prepTimeMinutes: 20, isAvailable: true, imageUrl: './images/paneer_tikka.png' },
  { id: 'm6', category: 'Starters', name: 'Pallipalayam Chicken Fry', description: 'Authentic Kongu-style dry chicken prepared with raw coconut slivers and red chilies.', price: 260, diet: 'non_veg', allergens: [], spiceLevel: 3, prepTimeMinutes: 18, isAvailable: true, imageUrl: './images/pallipalayam_chicken.png' },

  // Main Course
  { id: 'm7', category: 'Main Course', name: 'Malabar Fish Curry', description: 'Tuticorin coastal special fish cooked in a tangy, spiced coconut gravy with raw mango.', price: 320, diet: 'non_veg', allergens: [], spiceLevel: 2, prepTimeMinutes: 20, isAvailable: true, imageUrl: './images/fish_curry.png' },
  { id: 'm8', category: 'Main Course', name: 'Sangamithra Special Chicken Biryani', description: 'Premium Seeraga Samba rice chicken biryani slow-cooked with fresh mint and ghee.', price: 280, diet: 'non_veg', allergens: ['dairy'], spiceLevel: 2, prepTimeMinutes: 12, isAvailable: true, imageUrl: './images/biryani.png' },
  { id: 'm9', category: 'Main Course', name: 'Paneer Butter Masala', description: 'Soft paneer blocks simmered in a luscious tomato-butter-cream gravy.', price: 220, diet: 'veg', allergens: ['dairy', 'nuts'], spiceLevel: 1, prepTimeMinutes: 15, isAvailable: true, imageUrl: './images/paneer.png' },
  { id: 'm10', category: 'Main Course', name: 'Coin Parotta (3 Pcs)', description: 'Crispy, layered flaky flatbreads shaped like coins, perfect with fish curry.', price: 40, diet: 'veg', allergens: ['gluten'], spiceLevel: 0, prepTimeMinutes: 8, isAvailable: true, imageUrl: './images/coin_parotta.png' },
  { id: 'm11', category: 'Main Course', name: 'Butter Naan', description: 'Freshly baked tandoori wheat bread glazed with rich butter.', price: 60, diet: 'veg', allergens: ['gluten', 'dairy'], spiceLevel: 0, prepTimeMinutes: 8, isAvailable: true, imageUrl: './images/butter_naan.png' },

  // Desserts
  { id: 'm12', category: 'Desserts', name: 'Rasmalai (2 Pcs)', description: 'Chilled soft cottage cheese patties soaked in saffron-cardamom flavored milk.', price: 110, diet: 'veg', allergens: ['dairy', 'nuts'], spiceLevel: 0, prepTimeMinutes: 5, isAvailable: true, imageUrl: './images/rasmalai.png' },
  { id: 'm13', category: 'Desserts', name: 'Elaneer Payasam', description: 'Premium coconut-milk dessert mixed with tender coconut pulp slivers.', price: 130, diet: 'veg', allergens: ['dairy'], spiceLevel: 0, prepTimeMinutes: 5, isAvailable: true, imageUrl: './images/elaneer_payasam.png' }
];

const INITIAL_TABLES: DiningTable[] = [
  { id: 't1', tableNumber: 1, section: 'indoor', seatingCapacity: 4, status: 'vacant' },
  { id: 't2', tableNumber: 2, section: 'indoor', seatingCapacity: 2, status: 'occupied' },
  { id: 't3', tableNumber: 3, section: 'indoor', seatingCapacity: 6, status: 'vacant' },
  { id: 't4', tableNumber: 4, section: 'outdoor', seatingCapacity: 4, status: 'vacant' },
  { id: 't5', tableNumber: 5, section: 'outdoor', seatingCapacity: 2, status: 'vacant' },
  { id: 't6', tableNumber: 6, section: 'bbq', seatingCapacity: 4, status: 'vacant' },
  { id: 't7', tableNumber: 7, section: 'bbq', seatingCapacity: 8, status: 'occupied' },
  { id: 't8', tableNumber: 8, section: 'bbq', seatingCapacity: 6, status: 'dirty' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTableId, setActiveTableId] = useState<string>('t5'); // Default active scanner table: Table 5

  // Initialize with some active simulation logs & historical bills
  useEffect(() => {
    // Audit logs
    logAction('System', 'System Initialized. Local state active.');

    // Fetch live menu from SQLite backend
    fetch('http://localhost:3001/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data as MenuItem[]);
          logAction('System', 'Menu data successfully synced from local SQLite database.');
        }
      })
      .catch(err => {
        console.error('API Sync Failed:', err);
        logAction('System', 'Warning: Could not connect to API server. Using mock menu fallback.');
      });
    
    // Historical order & bill for Table 2 (occupied)
    const t2OrderItems: OrderItemRecord[] = [
      { id: 'oi-1', menuItemId: 'm1', name: 'Nattu Kozhi Soup', quantity: 2, unitPrice: 160, spiceLevel: 3, status: 'served', kitchenNotes: 'Spicy!' },
      { id: 'oi-2', menuItemId: 'm3', name: 'Chicken 65 (Dry)', quantity: 1, unitPrice: 210, spiceLevel: 2, status: 'served', kitchenNotes: '' },
      { id: 'oi-3', menuItemId: 'm10', name: 'Coin Parotta (3 Pcs)', quantity: 2, unitPrice: 40, spiceLevel: 0, status: 'preparing', kitchenNotes: 'Hot parottas' }
    ];
    const o2: OrderRecord = {
      id: 'o-2',
      tableId: 't2',
      tableNumber: 2,
      orderSequenceNumber: '#019',
      status: 'preparing',
      items: t2OrderItems,
      notes: 'Serve soup first.',
      createdTime: new Date(Date.now() - 35 * 60 * 1000), // 35 min ago
      updatedTime: new Date(Date.now() - 10 * 60 * 1000)
    };
    
    // Historical order & bill for Table 7 (occupied)
    const t7OrderItems: OrderItemRecord[] = [
      { id: 'oi-4', menuItemId: 'm6', name: 'Pallipalayam Chicken Fry', quantity: 1, unitPrice: 260, spiceLevel: 3, status: 'served', kitchenNotes: '' },
      { id: 'oi-5', menuItemId: 'm8', name: 'Sangamithra Special Chicken Biryani', quantity: 3, unitPrice: 280, spiceLevel: 2, status: 'served', kitchenNotes: '' },
      { id: 'oi-6', menuItemId: 'm13', name: 'Elaneer Payasam', quantity: 3, unitPrice: 130, spiceLevel: 0, status: 'ready', kitchenNotes: '' }
    ];
    const o7: OrderRecord = {
      id: 'o-7',
      tableId: 't7',
      tableNumber: 7,
      orderSequenceNumber: '#018',
      status: 'ready',
      items: t7OrderItems,
      notes: '',
      createdTime: new Date(Date.now() - 55 * 60 * 1000), // 55 min ago
      updatedTime: new Date(Date.now() - 5 * 60 * 1000)
    };

    setOrders([o2, o7]);

    // Active pending alerts for waiters
    setAlerts([
      {
        id: 'a-1',
        tableId: 't2',
        tableNumber: 2,
        alertType: 'water',
        status: 'unacknowledged',
        createdTime: new Date(Date.now() - 4 * 60 * 1000)
      },
      {
        id: 'a-2',
        tableId: 't7',
        tableNumber: 7,
        alertType: 'waiter',
        status: 'acknowledged',
        createdTime: new Date(Date.now() - 8 * 60 * 1000)
      }
    ]);

    // Generate 3 historical completed bills
    const sub1 = 640;
    const cgst1 = parseFloat((sub1 * 0.025).toFixed(2));
    const sgst1 = parseFloat((sub1 * 0.025).toFixed(2));
    const tip1 = 30;
    const b1: BillRecord = {
      id: 'b-historical-1',
      tableId: 't1',
      tableNumber: 1,
      billNumber: 'SM-2026-05-0104',
      subtotal: sub1,
      discount: 0,
      cgst: cgst1,
      sgst: sgst1,
      tip: tip1,
      grandTotal: sub1 + cgst1 + sgst1 + tip1,
      paymentMethod: 'upi',
      paymentStatus: 'captured',
      createdTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedTime: new Date(Date.now() - 1.8 * 60 * 60 * 1000)
    };

    const sub2 = 1420;
    const tip2 = 100;
    const b2: BillRecord = {
      id: 'b-historical-2',
      tableId: 't3',
      tableNumber: 3,
      billNumber: 'SM-2026-05-0105',
      subtotal: sub2,
      discount: 50, // Discount applied
      cgst: parseFloat(((sub2 - 50) * 0.025).toFixed(2)),
      sgst: parseFloat(((sub2 - 50) * 0.025).toFixed(2)),
      tip: tip2,
      grandTotal: sub2 - 50 + parseFloat(((sub2 - 50) * 0.025).toFixed(2)) * 2 + tip2,
      paymentMethod: 'card',
      paymentStatus: 'captured',
      createdTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      completedTime: new Date(Date.now() - 1.3 * 60 * 60 * 1000)
    };

    setBills([b1, b2]);
  }, []);

  const logAction = (role: string, details: string) => {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      actionType: 'AUDIT',
      details,
      userRole: role
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // --- Actions ---

  // 1. Diner Places an Order
  const placeOrder = (tableId: string, items: CartItem[], notes: string) => {
    if (items.length === 0) return;
    
    const targetTable = tables.find(t => t.id === tableId);
    const tableNum = targetTable ? targetTable.tableNumber : 0;
    
    // Generate order sequence
    const nextSeq = `#${String(orders.length + 20).padStart(3, '0')}`;
    
    const newItems: OrderItemRecord[] = items.map((item, idx) => ({
      id: `oi-${orders.length}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      spiceLevel: item.spiceLevel,
      status: 'new',
      kitchenNotes: item.customNotes
    }));

    const newOrder: OrderRecord = {
      id: `o-${orders.length}-${Math.random().toString(36).substr(2, 5)}`,
      tableId,
      tableNumber: tableNum,
      orderSequenceNumber: nextSeq,
      status: 'pending',
      items: newItems,
      notes,
      createdTime: new Date(),
      updatedTime: new Date()
    };

    // Update table status to occupied
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' } : t));
    
    // Append to global orders list
    setOrders(prev => [...prev, newOrder]);

    // Push standard alert to Waiters
    addStaffAlert(tableId, 'waiter');

    logAction('Customer', `Placed order ${nextSeq} at Table ${tableNum} (${items.length} items, total: ₹${items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)})`);
  };

  // 2. Kitchen Updates Item Status
  const updateOrderItemStatus = (orderId: string, itemId: string, status: ItemStatus) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, status };
        });

        // Determine order level status based on items
        let nextOrderStatus: OrderStatus = order.status;
        const allServed = updatedItems.every(i => i.status === 'served');
        const allReady = updatedItems.every(i => i.status === 'ready' || i.status === 'served');
        const anyPreparing = updatedItems.some(i => i.status === 'preparing');

        if (allServed) {
          nextOrderStatus = 'served';
        } else if (allReady) {
          nextOrderStatus = 'ready';
        } else if (anyPreparing || updatedItems.some(i => i.status === 'ready')) {
          nextOrderStatus = 'preparing';
        }

        const actionText = `Updated item "${order.items.find(i => i.id === itemId)?.name}" status to "${status}" on Order ${order.orderSequenceNumber} (Table ${order.tableNumber})`;
        logAction('Kitchen Staff', actionText);

        return {
          ...order,
          items: updatedItems,
          status: nextOrderStatus,
          updatedTime: new Date()
        };
      });
    });
  };

  // 3. Kitchen/Waiter updates overall Order Status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      // Cascade statuses to items if order is marked as served
      const updatedItems = order.items.map(item => {
        if (status === 'served' && item.status !== 'served') {
          return { ...item, status: 'served' as ItemStatus };
        }
        return item;
      });

      logAction('Kitchen/Waiter', `Updated Order ${order.orderSequenceNumber} status to "${status}"`);
      return {
        ...order,
        items: updatedItems,
        status,
        updatedTime: new Date()
      };
    }));
  };

  // 4. Kitchen Toggles Item Availability (Rasmalai out of stock)
  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const nextAvailable = !item.isAvailable;
      logAction('Staff', `Marked item "${item.name}" as ${nextAvailable ? 'In Stock' : 'Out of Stock'}`);
      return { ...item, isAvailable: nextAvailable };
    }));
  };

  // 5. Admin Changes Price
  const updateItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      logAction('Owner', `Updated price of "${item.name}" from ₹${item.price} to ₹${newPrice}`);
      return { ...item, price: newPrice };
    }));
  };

  // 6. Diner Calls Waiter / Requests Shortcuts
  const addStaffAlert = (tableId: string, alertType: AlertType) => {
    const targetTable = tables.find(t => t.id === tableId);
    const tableNum = targetTable ? targetTable.tableNumber : 0;
    
    // Check if duplicate alert of same type is already pending
    const exists = alerts.some(a => a.tableId === tableId && a.alertType === alertType && a.status !== 'resolved');
    if (exists) return;

    const newAlert: StaffAlert = {
      id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      tableId,
      tableNumber: tableNum,
      alertType,
      status: 'unacknowledged',
      createdTime: new Date()
    };

    setAlerts(prev => [newAlert, ...prev]);
    logAction('Customer', `Requested "${alertType}" at Table ${tableNum}`);
  };

  // 7. Waiter Acknowledges Alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id !== alertId) return alert;
      logAction('Waiter', `Acknowledged "${alert.alertType}" request for Table ${alert.tableNumber}`);
      return { ...alert, status: 'acknowledged' };
    }));
  };

  // 8. Waiter Resolves Alert
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id !== alertId) return alert;
      logAction('Waiter', `Resolved/Serviced "${alert.alertType}" request for Table ${alert.tableNumber}`);
      return { ...alert, status: 'resolved' };
    }));
  };

  // 9. Process Payment (UPI / Credit Card / Cash)
  const processPayment = (tableId: string, method: PaymentMethod, tip: number) => {
    const targetTable = tables.find(t => t.id === tableId);
    const tableNum = targetTable ? targetTable.tableNumber : 0;

    // Retrieve active orders for this table session
    const tableOrders = orders.filter(o => o.tableId === tableId && o.status !== 'completed' && o.status !== 'cancelled');
    if (tableOrders.length === 0) return;

    // Calculate subtotal
    let subtotal = 0;
    tableOrders.forEach(o => {
      o.items.forEach(i => {
        subtotal += i.unitPrice * i.quantity;
      });
    });

    const discount = 0;
    const taxableAmount = subtotal - discount;
    const cgst = parseFloat((taxableAmount * 0.025).toFixed(2)); // 2.5% CGST
    const sgst = parseFloat((taxableAmount * 0.025).toFixed(2)); // 2.5% SGST
    const grandTotal = taxableAmount + cgst + sgst + tip;

    const nextBillNum = `SM-2026-05-${String(bills.length + 106).padStart(4, '0')}`;

    const newBill: BillRecord = {
      id: `b-${bills.length}-${Math.random().toString(36).substr(2, 5)}`,
      tableId,
      tableNumber: tableNum,
      billNumber: nextBillNum,
      subtotal,
      discount,
      cgst,
      sgst,
      tip,
      grandTotal,
      paymentMethod: method,
      paymentStatus: 'captured',
      createdTime: new Date(),
      completedTime: new Date()
    };

    // Add to bills
    setBills(prev => [newBill, ...prev]);

    // Complete all active orders for this table session
    setOrders(prevOrders => {
      return prevOrders.map(o => {
        if (o.tableId === tableId && o.status !== 'completed' && o.status !== 'cancelled') {
          return { ...o, status: 'completed' as OrderStatus, updatedTime: new Date() };
        }
        return o;
      });
    });

    // Resolve any pending waiter alerts for this table
    setAlerts(prev => prev.map(a => a.tableId === tableId ? { ...a, status: 'resolved' as AlertStatus } : a));

    // Update table status to "dirty" (needs cleaning)
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'dirty' } : t));

    logAction('Billing', `Processed ₹${grandTotal.toFixed(2)} payment via ${method.toUpperCase()} for Table ${tableNum}. Generated invoice ${nextBillNum}. Table status marked as DIRTY.`);
  };

  // 10. Waiter Cleans Table (Dirty -> Vacant)
  const cleanTable = (tableId: string) => {
    const targetTable = tables.find(t => t.id === tableId);
    const tableNum = targetTable ? targetTable.tableNumber : 0;

    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'vacant' } : t));
    logAction('Waiter', `Table ${tableNum} cleaned and marked VACANT.`);
  };

  // 11. Trigger cleaning request (useful for testing states)
  const triggerCleanRequest = (tableId: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'dirty' } : t));
  };

  return (
    <AppContext.Provider
      value={{
        tables,
        menuItems,
        orders,
        alerts,
        bills,
        auditLogs,
        activeTableId,
        setActiveTableId,
        placeOrder,
        updateOrderItemStatus,
        updateOrderStatus,
        toggleItemAvailability,
        updateItemPrice,
        addStaffAlert,
        acknowledgeAlert,
        resolveAlert,
        processPayment,
        cleanTable,
        triggerCleanRequest
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
