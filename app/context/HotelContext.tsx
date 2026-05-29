"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

import { Smartphone, CreditCard, Wallet, Banknote, Coins } from "lucide-react";

// Payment methods used in Somalia
export const PAYMENT_METHODS = [
  { id: "zaad", label: "Zaad Pay", color: "#22c55e", icon: <Smartphone className="w-5 h-5 text-[#22c55e]" /> },
  { id: "edahab", label: "eDahab Pay", color: "#3b82f6", icon: <CreditCard className="w-5 h-5 text-[#3b82f6]" /> },
  { id: "golis", label: "Golis Pay", color: "#f59e0b", icon: <Smartphone className="w-5 h-5 text-[#f59e0b]" /> },
  { id: "evc", label: "EVC Plus", color: "#ef4444", icon: <Wallet className="w-5 h-5 text-[#ef4444]" /> },
  { id: "cash_usd", label: "Cash (USD)", color: "#10b981", icon: <Banknote className="w-5 h-5 text-[#10b981]" /> },
  { id: "cash_sos", label: "Cash (SOS)", color: "#8b5cf6", icon: <Coins className="w-5 h-5 text-[#8b5cf6]" /> },
] as const;

export type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"];

export type Room = { id: string; type: string; status: "Available" | "Occupied" | "Maintenance"; price: number };
export type Booking = { 
  id: string; guest: string; room: string; checkIn: string; checkOut: string; 
  amount: number;
  status: "Paid" | "Pending" | "Checked Out"; 
  paymentMethod: PaymentMethodId;
  currency: "USD" | "SOS";
  promiseToPayDate?: string; // ISO string date
};
export type Expense = { 
  id: string; date: string; description: string; category: string; amount: number;
  paymentMethod: PaymentMethodId;
  currency: "USD" | "SOS";
};
export type Guest = { id: string; name: string; phone: string; email: string; totalStays: number; lifetimeValue: number };
export type Staff = { id: string; name: string; role: string; phone: string; status: "Active" | "Off Duty"; shift: string };

interface HotelContextType {
  hotelName: string;
  setHotelName: (name: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  currentUserRole: "Admin" | "Staff";
  setCurrentUserRole: (role: "Admin" | "Staff") => void;
  
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoomStatus: (id: string, status: Room["status"]) => void;
  deleteRoom: (id: string) => void;
  editRoom: (id: string, updates: Partial<Room>) => void;

  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  editBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  updateBookingPaymentStatus: (id: string, status: "Paid" | "Pending") => void;
  updatePromiseToPay: (id: string, date: string | undefined) => void;
  endBooking: (id: string, room: string) => void;

  expenses: Expense[];
  addExpense: (expense: Expense) => void;

  guests: Guest[];
  addGuest: (guest: Guest) => void;

  staff: Staff[];
  addStaff: (employee: Staff) => void;

  formatCurrency: (usdAmount: number) => string;
  formatAmount: (amount: number, cur: "USD" | "SOS") => string;
  toUSD: (amount: number, cur: "USD" | "SOS") => number;
  isLoading: boolean;
}

export const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Use a fixed hotel ID for MVP multi-tenancy
const HOTEL_ID = "00000000-0000-0000-0000-000000000000";

export function HotelProvider({ children }: { children: React.ReactNode }) {
  // Create supabase client once and store in a ref to prevent re-renders
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  const [hotelName, setHotelNameState] = useState("Hargeisa Grand");
  const [currency, setCurrencyState] = useState("USD");
  const [exchangeRate, setExchangeRateState] = useState(8500);
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Staff">("Admin");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogo = localStorage.getItem('hotel_logo');
      if (savedLogo) setLogoUrlState(savedLogo);
    }
  }, []);

  const setLogoUrl = useCallback((url: string | null) => {
    setLogoUrlState(url);
    if (url) localStorage.setItem('hotel_logo', url);
    else localStorage.removeItem('hotel_logo');
  }, []);

  const setExchangeRate = useCallback(async (rate: number) => {
    setExchangeRateState(rate);
    const { error } = await supabase.from('hotels').update({ exchange_rate: rate }).eq('id', HOTEL_ID);
    if (error) console.error("updateExchangeRate error:", error.message);
  }, [supabase]);

  const setHotelName = useCallback(async (name: string) => {
    setHotelNameState(name);
    const { error } = await supabase.from('hotels').update({ name }).eq('id', HOTEL_ID);
    if (error) console.error("updateHotelName error:", error.message);
  }, [supabase]);

  const setCurrency = useCallback(async (curr: string) => {
    setCurrencyState(curr);
    const { error } = await supabase.from('hotels').update({ currency_primary: curr }).eq('id', HOTEL_ID);
    if (error) console.error("updateCurrency error:", error.message);
  }, [supabase]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [promiseDates, setPromiseDates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const fetchFailed = useRef(false);

  // Initial Data Fetch - runs once on mount
  useEffect(() => {
    let cancelled = false;
    
    // Load from cache first
    const cachedData = localStorage.getItem('hotelCache_' + HOTEL_ID);
    if (cachedData) {
      try {
        const cache = JSON.parse(cachedData);
        if (cache.rooms) setRooms(cache.rooms);
        if (cache.bookings) setBookings(cache.bookings);
        if (cache.expenses) setExpenses(cache.expenses);
        if (cache.guests) setGuests(cache.guests);
        if (cache.staff) setStaff(cache.staff);
        if (cache.promiseDates) setPromiseDates(cache.promiseDates);
        
        // Load hotel settings from cache too
        if (cache.hotelName) setHotelNameState(cache.hotelName);
        if (cache.currency) setCurrencyState(cache.currency);
        if (cache.exchangeRate) setExchangeRateState(cache.exchangeRate);
        
        setIsLoading(false);
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
    
    async function fetchData() {
      if (!cachedData) setIsLoading(true);
      
      try {
        // Fetch Hotel Settings
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels').select('*').eq('id', HOTEL_ID).single();
        
        if (!cancelled && hotelData && !hotelError) {
          setHotelNameState(hotelData.name);
          if (hotelData.currency_primary) setCurrencyState(hotelData.currency_primary);
          if (hotelData.exchange_rate) setExchangeRateState(hotelData.exchange_rate);
        }

        // Fetch Rooms
        const { data: roomsData } = await supabase
          .from('rooms').select('*').eq('hotel_id', HOTEL_ID);
        if (!cancelled && roomsData) {
          setRooms(roomsData.map(r => ({
            id: r.room_number || r.id,
            type: r.type,
            status: r.status === 'occupied' ? 'Occupied' : r.status === 'maintenance' ? 'Maintenance' : 'Available',
            price: r.price_per_night
          })));
        }

        // Fetch Guests
        const { data: guestsData } = await supabase
          .from('guests').select('*').eq('hotel_id', HOTEL_ID);
        if (!cancelled && guestsData) {
          setGuests(guestsData.map(g => ({
            id: g.id,
            name: g.full_name,
            phone: g.phone || "-",
            email: g.email || "-",
            totalStays: 0,
            lifetimeValue: 0
          })));
        }

        // Fetch Bookings
        const { data: bookingsData } = await supabase
          .from('bookings').select('*, guests(full_name)').eq('hotel_id', HOTEL_ID);
        if (!cancelled && bookingsData) {
          const promises = JSON.parse(localStorage.getItem('hotelPromises_' + HOTEL_ID) || '{}');
          if (Object.keys(promises).length > 0) setPromiseDates(promises);

          setBookings(bookingsData.map(b => ({
            id: b.id,
            guest: b.guests?.full_name || 'Unknown Guest',
            room: b.room_id || '-',
            checkIn: b.check_in,
            checkOut: b.check_out,
            amount: b.total_amount,
            status: b.room_id === null ? "Checked Out" : (b.paid ? "Paid" : "Pending"),
            paymentMethod: (b.payment_method || "cash_usd") as PaymentMethodId,
            currency: (b.currency || "USD") as "USD" | "SOS",
            promiseToPayDate: promises[b.id]
          })));
        }

        // Fetch Expenses
        const { data: expensesData } = await supabase
          .from('expenses').select('*').eq('hotel_id', HOTEL_ID);
        if (!cancelled && expensesData) {
          setExpenses(expensesData.map(e => ({
            id: e.id,
            date: e.date,
            description: e.description || "",
            category: e.category,
            amount: e.amount,
            paymentMethod: (e.payment_method || "cash_usd") as PaymentMethodId,
            currency: (e.currency || "USD") as "USD" | "SOS"
          })));
        }

        // Fetch Staff
        const { data: staffData } = await supabase
          .from('staff').select('*').eq('hotel_id', HOTEL_ID);
        if (!cancelled && staffData) {
          setStaff(staffData.map(s => ({
            id: s.id,
            name: s.full_name,
            role: s.role || "Receptionist",
            phone: s.phone || "",
            status: s.status === 'active' ? 'Active' : 'Off Duty',
            shift: s.shift || "Morning"
          })));
        }
      } catch (err) {
        console.error("Error fetching hotel data:", err);
        fetchFailed.current = true;
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }
    
    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to cache whenever it changes (optional but good for saving local updates quickly)
  useEffect(() => {
    if (isLoading || fetchFailed.current) return;
    const cache = { rooms, bookings, expenses, guests, staff, promiseDates, hotelName, currency, exchangeRate };
    localStorage.setItem('hotelCache_' + HOTEL_ID, JSON.stringify(cache));
    localStorage.setItem('hotelPromises_' + HOTEL_ID, JSON.stringify(promiseDates));
  }, [rooms, bookings, expenses, guests, staff, promiseDates, hotelName, currency, exchangeRate, isLoading]);

  // Mutations
  const addRoom = useCallback(async (room: Room) => {
    setRooms(prev => [...prev, room]);
    const { error } = await supabase.from('rooms').insert({
      hotel_id: HOTEL_ID,
      room_number: room.id,
      type: room.type,
      price_per_night: room.price,
      status: room.status.toLowerCase()
    });
    if (error) console.error("addRoom error:", error.message);
  }, [supabase]);

  const updateRoomStatus = useCallback(async (id: string, status: Room["status"]) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const { error } = await supabase.from('rooms')
      .update({ status: status.toLowerCase() })
      .eq('hotel_id', HOTEL_ID)
      .eq('room_number', id);
    if (error) console.error("updateRoomStatus error:", error.message);
  }, [supabase]);

  const deleteRoom = useCallback(async (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from('rooms').delete().eq('room_number', id).eq('hotel_id', HOTEL_ID);
    if (error) console.error("deleteRoom error:", error.message);
  }, [supabase]);

  const editRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    const oldId = id;
    const newId = updates.id || id;
    
    // Update room in local state
    setRooms(prev => prev.map(r => r.id === oldId ? { ...r, ...updates } : r));
    
    // If room number changed, cascade to bookings
    if (updates.id && updates.id !== oldId) {
      setBookings(prev => prev.map(b => b.room === oldId ? { ...b, room: newId } : b));
      // Update bookings in Supabase
      await supabase.from('bookings')
        .update({ room_id: newId })
        .eq('room_id', oldId)
        .eq('hotel_id', HOTEL_ID);
    }
    
    // Build the Supabase update payload
    const dbUpdates: Record<string, unknown> = {};
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.price) dbUpdates.price_per_night = updates.price;
    if (updates.status) dbUpdates.status = updates.status.toLowerCase();
    if (updates.id && updates.id !== oldId) dbUpdates.room_number = newId;
    
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('rooms')
        .update(dbUpdates)
        .eq('room_number', oldId)
        .eq('hotel_id', HOTEL_ID);
      if (error) console.error("editRoom error:", error.message);
    }
  }, [supabase]);

  const addBooking = useCallback(async (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    // Mark the room as occupied
    updateRoomStatus(booking.room, "Occupied");
    
    const { error } = await supabase.from('bookings').insert({
      hotel_id: HOTEL_ID,
      guest_id: null,
      room_id: booking.room,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total_amount: booking.amount,
      paid: booking.status === 'Paid',
      payment_method: booking.paymentMethod,
      currency: booking.currency
    });
    if (error) console.error("addBooking error:", error.message);
  }, [supabase, updateRoomStatus]);

  const editBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    // If room assignment changed, update old room to Available and new room to Occupied
    const oldBooking = bookings.find(b => b.id === id);
    if (oldBooking && updates.room && updates.room !== oldBooking.room) {
      if (oldBooking.room && oldBooking.room !== '-') {
        updateRoomStatus(oldBooking.room, "Available");
      }
      if (updates.room !== '-') {
        updateRoomStatus(updates.room, "Occupied");
      }
    }
    
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.guest !== undefined) dbUpdates.guest_name = updates.guest;
    if (updates.room !== undefined) dbUpdates.room_id = updates.room === '-' ? null : updates.room;
    if (updates.checkIn !== undefined) dbUpdates.check_in = updates.checkIn;
    if (updates.checkOut !== undefined) dbUpdates.check_out = updates.checkOut;
    if (updates.amount !== undefined) dbUpdates.total_amount = updates.amount;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.status !== undefined) dbUpdates.paid = updates.status === 'Paid';
    
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('bookings')
        .update(dbUpdates)
        .eq('id', id)
        .eq('hotel_id', HOTEL_ID);
      if (error) console.error("editBooking error:", error.message);
    }
  }, [supabase, bookings, updateRoomStatus]);

  const deleteBooking = useCallback(async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    // Free the room if the booking had an active room
    if (booking && booking.room && booking.room !== '-' && booking.status !== 'Checked Out') {
      updateRoomStatus(booking.room, "Available");
    }
    
    setBookings(prev => prev.filter(b => b.id !== id));
    
    const { error } = await supabase.from('bookings').delete()
      .eq('id', id)
      .eq('hotel_id', HOTEL_ID);
    if (error) console.error("deleteBooking error:", error.message);
  }, [supabase, updateRoomStatus]);

  const updateBookingPaymentStatus = useCallback(async (id: string, status: "Paid" | "Pending") => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: b.room === '-' && status === "Pending" ? "Checked Out" : status } : b));
    const { error } = await supabase.from('bookings')
      .update({ paid: status === "Paid" })
      .eq('id', id)
      .eq('hotel_id', HOTEL_ID);
    if (error) console.error("updateBookingPaymentStatus error:", error.message);
  }, [supabase]);

  const updatePromiseToPay = useCallback((id: string, date: string | undefined) => {
    setPromiseDates(prev => {
      const next = { ...prev };
      if (date) next[id] = date;
      else delete next[id];
      return next;
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, promiseToPayDate: date } : b));
  }, []);

  const endBooking = useCallback(async (id: string, room: string) => {
    // 1. Mark the room as available
    if (room && room !== '-') {
      updateRoomStatus(room, "Available");
    }
    
    // 2. Mark booking as Checked Out and remove room association
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Checked Out", room: "-" } : b));
    
    // 3. Update in Supabase
    const { error } = await supabase.from('bookings').update({ room_id: null }).eq('id', id);
    if (error) console.error("endBooking error:", error.message);
  }, [updateRoomStatus, supabase]);

  const addExpense = useCallback(async (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    const { error } = await supabase.from('expenses').insert({
      hotel_id: HOTEL_ID,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      payment_method: expense.paymentMethod,
      currency: expense.currency
    });
    if (error) console.error("addExpense error:", error.message);
  }, [supabase]);

  const addGuest = useCallback(async (guest: Guest) => {
    setGuests(prev => [guest, ...prev]);
    const { error } = await supabase.from('guests').insert({
      hotel_id: HOTEL_ID,
      full_name: guest.name,
      phone: guest.phone === "-" ? null : guest.phone,
      email: guest.email === "-" ? null : guest.email
    });
    if (error) console.error("addGuest error:", error.message);
  }, [supabase]);

  const addStaff = useCallback(async (employee: Staff) => {
    setStaff(prev => [employee, ...prev]);
    const { error } = await supabase.from('staff').insert({
      hotel_id: HOTEL_ID,
      full_name: employee.name,
      role: employee.role,
      phone: employee.phone || null,
      shift: employee.shift,
      status: employee.status === 'Active' ? 'active' : 'inactive'
    });
    if (error) console.error("addStaff error:", error.message);
  }, [supabase]);



  // Convert amount to USD equivalent
  const toUSD = useCallback((amount: number, cur: "USD" | "SOS"): number => {
    if (cur === "SOS" && exchangeRate > 0) return amount / exchangeRate;
    return amount;
  }, [exchangeRate]);

  const formatCurrency = useCallback((usdAmount: number) => {
    if (currency === "USD") {
      return `$${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `${(usdAmount * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} SOS`;
  }, [currency, exchangeRate]);

  // Format any amount with its native currency
  const formatAmount = useCallback((amount: number, cur: "USD" | "SOS"): string => {
    if (cur === "USD") return `$${amount.toLocaleString()}`;
    return `${amount.toLocaleString()} SOS`;
  }, []);

  return (
    <HotelContext.Provider value={{
      hotelName, setHotelName, currency, setCurrency, exchangeRate, setExchangeRate,
      logoUrl, setLogoUrl,
      currentUserRole, setCurrentUserRole,
      rooms, addRoom, updateRoomStatus, deleteRoom, editRoom,
      bookings, addBooking, editBooking, deleteBooking, updateBookingPaymentStatus, updatePromiseToPay, endBooking,
      expenses, addExpense,
      guests, addGuest,
      staff, addStaff,
      formatCurrency, formatAmount, toUSD,
      isLoading
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
}
