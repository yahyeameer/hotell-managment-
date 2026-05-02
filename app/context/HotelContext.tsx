"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type Room = { id: string; type: string; status: "Available" | "Occupied" | "Maintenance"; price: number };
export type Booking = { id: string; guest: string; room: string; checkIn: string; checkOut: string; amount: number; status: "Paid" | "Pending" };
export type Expense = { id: string; date: string; description: string; category: string; amount: number };
export type Guest = { id: string; name: string; phone: string; email: string; totalStays: number; lifetimeValue: number };
export type Staff = { id: string; name: string; role: string; phone: string; status: "Active" | "Off Duty"; shift: string };

interface HotelContextType {
  hotelName: string;
  setHotelName: (name: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoomStatus: (id: string, status: Room["status"]) => void;

  bookings: Booking[];
  addBooking: (booking: Booking) => void;

  expenses: Expense[];
  addExpense: (expense: Expense) => void;

  guests: Guest[];
  addGuest: (guest: Guest) => void;

  staff: Staff[];
  addStaff: (employee: Staff) => void;

  formatCurrency: (usdAmount: number) => string;
  isLoading: boolean;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Use a fixed hotel ID for MVP multi-tenancy
const HOTEL_ID = "00000000-0000-0000-0000-000000000000";

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  
  const [hotelName, setHotelName] = useState("Hargeisa Grand");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(8500);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Fetch Hotel Settings
      const { data: hotelData } = await supabase.from('hotels').select('*').eq('id', HOTEL_ID).single();
      if (hotelData) {
        setHotelName(hotelData.name);
        setCurrency(hotelData.currency_primary);
      }

      // Fetch Rooms
      const { data: roomsData } = await supabase.from('rooms').select('*').eq('hotel_id', HOTEL_ID);
      if (roomsData) {
        setRooms(roomsData.map(r => ({
          id: r.id,
          type: r.type,
          status: r.status === 'occupied' ? 'Occupied' : r.status === 'maintenance' ? 'Maintenance' : 'Available',
          price: r.price_per_night
        })));
      }

      // Fetch Guests
      const { data: guestsData } = await supabase.from('guests').select('*').eq('hotel_id', HOTEL_ID);
      if (guestsData) {
        setGuests(guestsData.map(g => ({
          id: g.id,
          name: g.full_name,
          phone: g.phone || "-",
          email: "-",
          totalStays: 0, // Calculated ideally
          lifetimeValue: 0 // Calculated ideally
        })));
      }

      // Fetch Bookings
      const { data: bookingsData } = await supabase.from('bookings').select('*, guests(full_name)').eq('hotel_id', HOTEL_ID);
      if (bookingsData) {
        setBookings(bookingsData.map(b => ({
          id: b.id,
          guest: b.guests?.full_name || b.guest_id,
          room: b.room_id,
          checkIn: b.check_in,
          checkOut: b.check_out,
          amount: b.total_amount,
          status: b.paid ? "Paid" : "Pending"
        })));
      }

      // Fetch Expenses
      const { data: expensesData } = await supabase.from('expenses').select('*').eq('hotel_id', HOTEL_ID);
      if (expensesData) {
        setExpenses(expensesData.map(e => ({
          id: e.id,
          date: e.date,
          description: e.description || "",
          category: e.category,
          amount: e.amount
        })));
      }

      // Fetch Staff
      const { data: staffData } = await supabase.from('staff').select('*').eq('hotel_id', HOTEL_ID);
      if (staffData) {
        setStaff(staffData.map(s => ({
          id: s.id,
          name: s.full_name,
          role: s.role,
          phone: s.phone || "",
          status: s.status === 'active' ? 'Active' : 'Off Duty',
          shift: "Morning"
        })));
      }

      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase]);

  // Mutations
  const addRoom = async (room: Room) => {
    // Optimistic UI
    setRooms([...rooms, room]);
    
    // DB
    await supabase.from('rooms').insert({
      id: room.id.includes('-') ? room.id : undefined, // let postgres generate if simple id
      hotel_id: HOTEL_ID,
      room_number: room.id,
      type: room.type,
      price_per_night: room.price,
      status: room.status.toLowerCase()
    });
  };

  const updateRoomStatus = async (id: string, status: Room["status"]) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('rooms').update({ status: status.toLowerCase() }).match({ room_number: id, hotel_id: HOTEL_ID });
  };

  const addBooking = async (booking: Booking) => {
    setBookings([booking, ...bookings]);
    updateRoomStatus(booking.room, "Occupied");

    await supabase.from('bookings').insert({
      hotel_id: HOTEL_ID,
      guest_id: null, // would need real UUID in prod or skip strict relations for MVP
      room_id: null, // same
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total_amount: booking.amount,
      paid: booking.status === 'Paid'
    });
  };

  const addExpense = async (expense: Expense) => {
    setExpenses([expense, ...expenses]);
    await supabase.from('expenses').insert({
      hotel_id: HOTEL_ID,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    });
  };

  const addGuest = async (guest: Guest) => {
    setGuests([guest, ...guests]);
    await supabase.from('guests').insert({
      hotel_id: HOTEL_ID,
      full_name: guest.name,
      phone: guest.phone
    });
  };

  const addStaff = async (employee: Staff) => {
    setStaff([employee, ...staff]);
    await supabase.from('staff').insert({
      hotel_id: HOTEL_ID,
      full_name: employee.name,
      role: employee.role,
      phone: employee.phone,
      status: employee.status === 'Active' ? 'active' : 'inactive'
    });
  };

  // Keep hotel settings in sync
  useEffect(() => {
    if (!isLoading) {
      supabase.from('hotels').update({ name: hotelName, currency_primary: currency }).eq('id', HOTEL_ID).then();
    }
  }, [hotelName, currency, isLoading, supabase]);

  const formatCurrency = (usdAmount: number) => {
    if (currency === "USD") {
      return `$${usdAmount.toLocaleString()}`;
    }
    return `${(usdAmount * exchangeRate).toLocaleString()} SOS`;
  };

  return (
    <HotelContext.Provider value={{
      hotelName, setHotelName, currency, setCurrency, exchangeRate, setExchangeRate,
      rooms, addRoom, updateRoomStatus,
      bookings, addBooking,
      expenses, addExpense,
      guests, addGuest,
      staff, addStaff,
      formatCurrency,
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
