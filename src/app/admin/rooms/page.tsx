"use client"

import { useEffect, useState } from "react"
import { canManageRoomInventory } from "@/lib/admin-permissions"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import RoomStatusCard from "@/components/admin/RoomStatusCard"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import { BedDouble, Pencil, Plus, Trash2 } from "lucide-react"

interface Room {
  id: string
  number: string
  floor: number
  status: string
  notes: string | null
  type?: { name: string; slug: string }
  roomType?: { name: string; slug: string }
}

interface RoomTypeOption {
  id: string
  name: string
  slug: string
}

interface RoomFormState {
  number: string
  floor: string
  roomTypeId: string
  status: string
  notes: string
}

const ROOM_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "AVAILABLE", label: "Disponibles" },
  { value: "OCCUPIED", label: "Ocupadas" },
  { value: "HOUSEKEEPING", label: "Limpieza" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
  { value: "OUT_OF_ORDER", label: "Fuera de servicio" },
]

const ROOM_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "OCCUPIED", label: "Ocupada" },
  { value: "HOUSEKEEPING", label: "Limpieza" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
  { value: "OUT_OF_ORDER", label: "Fuera de servicio" },
]

const EMPTY_FORM: RoomFormState = {
  number: "",
  floor: "1",
  roomTypeId: "",
  status: "AVAILABLE",
  notes: "",
}

export default function AdminRoomsPage() {
  const { role } = useCurrentRole()
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [pageError, setPageError] = useState("")

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    setLoading(true)
    setPageError("")
    try {
      const response = await fetch("/api/rooms")
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setPageError(data?.error || "No se pudo cargar el inventario")
        setRooms([])
        setRoomTypes([])
        return
      }
      setRooms(data.rooms || [])
      setRoomTypes(data.roomTypes || [])
    } catch (error) {
      console.error(error)
      setPageError("No se pudo cargar el inventario")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(roomId: string, newStatus: string) {
    const res = await fetch(`/api/rooms/${roomId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, status: newStatus } : r))
    }
  }

  const canManageInventory = canManageRoomInventory(role)

  const filtered = filter === "ALL" ? rooms : rooms.filter((r) => r.status === filter)
  const floors = [...new Set(filtered.map((r) => r.floor))].sort()
  const getTypeName = (room: Room) => room.roomType?.name ?? room.type?.name ?? "Sin tipo"

  function updateForm<K extends keyof RoomFormState>(key: K, value: RoomFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreateModal() {
    setEditingRoomId(null)
    setForm({
      ...EMPTY_FORM,
      roomTypeId: roomTypes[0]?.id || "",
    })
    setFormError("")
    setModalOpen(true)
  }

  function openEditModal(room: Room) {
    setEditingRoomId(room.id)
    setForm({
      number: room.number,
      floor: String(room.floor),
      roomTypeId: (room.roomType as RoomTypeOption | undefined)?.id || "",
      status: room.status,
      notes: room.notes || "",
    })
    setFormError("")
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setEditingRoomId(null)
    setForm(EMPTY_FORM)
    setFormError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")

    const payload = {
      number: form.number.trim(),
      floor: Number(form.floor),
      roomTypeId: form.roomTypeId,
      status: form.status,
      notes: form.notes,
    }

    const endpoint = editingRoomId ? `/api/rooms/${editingRoomId}` : "/api/rooms"
    const method = editingRoomId ? "PATCH" : "POST"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setFormError(data?.error || "No se pudo guardar la habitación")
        return
      }

      await fetchRooms()
      closeModal()
    } catch (error) {
      console.error(error)
      setFormError("No se pudo guardar la habitación")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(room: Room) {
    const confirmed = window.confirm(`¿Eliminar la habitación ${room.number}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        window.alert(data?.error || "No se pudo eliminar la habitación")
        return
      }

      await fetchRooms()
    } catch (error) {
      console.error(error)
      window.alert("No se pudo eliminar la habitación")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Habitaciones</h1>
          <p className="font-sans text-sm text-slate-500">{rooms.length} habitaciones totales</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {ROOM_FILTERS.map((statusOption) => (
            <button
              key={statusOption.value}
              onClick={() => setFilter(statusOption.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                filter === statusOption.value ? "bg-navy-900 text-white" : "bg-ivory-100 text-slate-600 hover:bg-ivory-200"
              }`}
            >
              {statusOption.label}
            </button>
          ))}
          {canManageInventory && (
            <Button size="sm" variant="gold" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Nueva habitación
            </Button>
          )}
        </div>
      </div>

      {!loading && pageError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="font-sans text-sm text-amber-900">{pageError}</p>
        </div>
      )}

      {!loading && !canManageInventory && !pageError && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="font-sans text-sm text-sky-900">Tu perfil puede consultar estados operativos, pero no crear, editar ni eliminar habitaciones.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : (
        floors.map((floor) => (
          <div key={floor} className="mb-8">
            <h2 className="font-sans text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-gold-500" />
              Piso {floor}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered
                .filter((r) => r.floor === floor)
                .map((room) => (
                  <div key={room.id} className="space-y-2">
                    <RoomStatusCard
                      roomNumber={room.number}
                      floor={room.floor}
                      typeName={getTypeName(room)}
                      status={room.status}
                      notes={room.notes}
                      onStatusChange={(newStatus) => handleStatusChange(room.id, newStatus)}
                    />
                    {canManageInventory && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditModal(room)}>
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDelete(room)}>
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingRoomId ? "Editar habitación" : "Nueva habitación"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="room-number"
              label="Número"
              value={form.number}
              onChange={(e) => updateForm("number", e.target.value)}
              placeholder="Ej. 101"
              required
            />
            <Input
              id="room-floor"
              label="Piso"
              type="number"
              min={1}
              value={form.floor}
              onChange={(e) => updateForm("floor", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="room-type" className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">
                Tipo de habitación
              </label>
              <select
                id="room-type"
                value={form.roomTypeId}
                onChange={(e) => updateForm("roomTypeId", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                required
              >
                <option value="" disabled>Selecciona un tipo</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="room-status" className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">
                Estado
              </label>
              <select
                id="room-status"
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              >
                {ROOM_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="room-notes" className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">
              Notas
            </label>
            <textarea
              id="room-notes"
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              placeholder="Observaciones de housekeeping, mantenimiento o inventario"
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 font-sans text-sm text-rose-700">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" loading={submitting}>
              {editingRoomId ? "Guardar cambios" : "Crear habitación"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
