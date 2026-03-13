"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import { Pencil, Plus, Tags, Trash2 } from "lucide-react"

interface RoomTypeItem {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string | null
  basePrice: number
  weekendSurcharge: number
  maxGuests: number
  bedConfiguration: string
  sizeSqm: number | null
  floor: string | null
  view: string | null
  _count: {
    rooms: number
    reservations: number
    extras: number
    seasonalPrices: number
  }
}

interface RoomTypeFormState {
  name: string
  slug: string
  description: string
  shortDesc: string
  basePrice: string
  weekendSurcharge: string
  maxGuests: string
  bedConfiguration: string
  sizeSqm: string
  floor: string
  view: string
}

const EMPTY_FORM: RoomTypeFormState = {
  name: "",
  slug: "",
  description: "",
  shortDesc: "",
  basePrice: "180",
  weekendSurcharge: "0.15",
  maxGuests: "2",
  bedConfiguration: "",
  sizeSqm: "",
  floor: "",
  view: "",
}

export default function AdminRoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomTypeFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  async function fetchRoomTypes() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/room-types")
      const data = await response.json()
      setRoomTypes(data.roomTypes || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function updateForm<K extends keyof RoomTypeFormState>(key: K, value: RoomTypeFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setModalOpen(true)
  }

  function openEditModal(roomType: RoomTypeItem) {
    setEditingId(roomType.id)
    setForm({
      name: roomType.name,
      slug: roomType.slug,
      description: roomType.description,
      shortDesc: roomType.shortDesc || "",
      basePrice: String(roomType.basePrice),
      weekendSurcharge: String(roomType.weekendSurcharge),
      maxGuests: String(roomType.maxGuests),
      bedConfiguration: roomType.bedConfiguration,
      sizeSqm: roomType.sizeSqm ? String(roomType.sizeSqm) : "",
      floor: roomType.floor || "",
      view: roomType.view || "",
    })
    setFormError("")
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      shortDesc: form.shortDesc.trim() || undefined,
      basePrice: Number(form.basePrice),
      weekendSurcharge: Number(form.weekendSurcharge),
      maxGuests: Number(form.maxGuests),
      bedConfiguration: form.bedConfiguration.trim(),
      sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
      floor: form.floor.trim() || undefined,
      view: form.view.trim() || undefined,
    }

    const endpoint = editingId ? `/api/admin/room-types/${editingId}` : "/api/admin/room-types"
    const method = editingId ? "PATCH" : "POST"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setFormError(data?.error || "No se pudo guardar el tipo de habitación")
        return
      }

      await fetchRoomTypes()
      closeModal()
    } catch (error) {
      console.error(error)
      setFormError("No se pudo guardar el tipo de habitación")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(roomType: RoomTypeItem) {
    const confirmed = window.confirm(`¿Eliminar el tipo ${roomType.name}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/room-types/${roomType.id}`, { method: "DELETE" })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        window.alert(data?.error || "No se pudo eliminar el tipo de habitación")
        return
      }

      await fetchRoomTypes()
    } catch (error) {
      console.error(error)
      window.alert("No se pudo eliminar el tipo de habitación")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Tipos de habitación</h1>
          <p className="font-sans text-sm text-slate-500">Configura inventario comercial, precios base y capacidad</p>
        </div>
        <Button variant="gold" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Nuevo tipo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="card" className="h-56" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tags className="w-4 h-4 text-gold-500" />
                    <p className="font-serif text-xl font-semibold text-navy-900">{roomType.name}</p>
                  </div>
                  <p className="font-sans text-xs uppercase tracking-wider text-slate-400">/{roomType.slug}</p>
                </div>
                <Badge variant="gold">S/ {roomType.basePrice.toFixed(2)}</Badge>
              </div>

              <p className="mt-4 font-sans text-sm text-slate-600 line-clamp-3">{roomType.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="info">{roomType.maxGuests} huésped(es)</Badge>
                <Badge variant="default">{roomType.bedConfiguration}</Badge>
                {roomType.sizeSqm && <Badge variant="default">{roomType.sizeSqm} m²</Badge>}
                {roomType.floor && <Badge variant="default">{roomType.floor}</Badge>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 font-sans text-xs text-slate-500">
                <p>Habitaciones: <span className="font-bold text-navy-900">{roomType._count.rooms}</span></p>
                <p>Reservas: <span className="font-bold text-navy-900">{roomType._count.reservations}</span></p>
                <p>Extras vinculados: <span className="font-bold text-navy-900">{roomType._count.extras}</span></p>
                <p>Temporadas: <span className="font-bold text-navy-900">{roomType._count.seasonalPrices}</span></p>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEditModal(roomType)}>
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => handleDelete(roomType)}>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Editar tipo" : "Nuevo tipo"} size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
            <Input label="Slug" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} required />
            <Input label="Precio base" type="number" min={1} step="0.01" value={form.basePrice} onChange={(e) => updateForm("basePrice", e.target.value)} required />
            <Input label="Recargo fin de semana" type="number" min={0} max={1} step="0.01" value={form.weekendSurcharge} onChange={(e) => updateForm("weekendSurcharge", e.target.value)} required />
            <Input label="Máx. huéspedes" type="number" min={1} max={10} value={form.maxGuests} onChange={(e) => updateForm("maxGuests", e.target.value)} required />
            <Input label="Configuración de camas" value={form.bedConfiguration} onChange={(e) => updateForm("bedConfiguration", e.target.value)} required />
            <Input label="Metros cuadrados" type="number" min={1} value={form.sizeSqm} onChange={(e) => updateForm("sizeSqm", e.target.value)} />
            <Input label="Ubicación / pisos" value={form.floor} onChange={(e) => updateForm("floor", e.target.value)} />
            <div className="md:col-span-2">
              <Input label="Vista" value={form.view} onChange={(e) => updateForm("view", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Resumen corto</label>
            <textarea value={form.shortDesc} onChange={(e) => updateForm("shortDesc", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Descripción</label>
            <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={5} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" required />
          </div>

          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 font-sans text-sm text-rose-700">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="gold" loading={submitting}>{editingId ? "Guardar cambios" : "Crear tipo"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}