import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/client";
import SectionCard from "../components/SectionCard";

export default function ResourceBookingPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    resourceType: "Room",
    resourceName: "",
    department: "",
    start: "",
    end: ""
  });
  const [error, setError] = useState("");

  const { data: org } = useQuery({ queryKey: ["org"], queryFn: async () => (await api.get("/org")).data });
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: async () => (await api.get("/bookings")).data });

  const createBooking = useMutation({
    mutationFn: async () => api.post("/bookings", form),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => setError(err.response?.data?.message || "Booking failed")
  });

  const cancel = useMutation({
    mutationFn: async (id) => api.post(`/bookings/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] })
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Create Booking (No overlaps allowed)">
        <div className="grid gap-2 md:grid-cols-6">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-lg border p-2" />
          <select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })} className="rounded-lg border p-2">
            <option>Room</option><option>Vehicle</option><option>Equipment</option>
          </select>
          <input value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} placeholder="Resource name" className="rounded-lg border p-2" />
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-lg border p-2">
            <option value="">Department</option>
            {(org?.departments || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="rounded-lg border p-2" />
          <input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="rounded-lg border p-2" />
        </div>
        <button onClick={() => createBooking.mutate()} className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-white">Book Resource</button>
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
      </SectionCard>

      <SectionCard title="Calendar View (Day/Week/Month)">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          events={bookings.map((b) => ({ id: b._id, title: `${b.title} (${b.resourceName})`, start: b.start, end: b.end }))}
          height={620}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {bookings.map((b) => (
            <button key={b._id} onClick={() => cancel.mutate(b._id)} className="rounded bg-slate-800 px-2 py-1 text-white">
              Cancel: {b.title}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
