"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import { Gift, Pencil, Plus, Trash2 } from "lucide-react"

interface RoomTypeOption {
  id: string
  name: string
}

interface ExtraItem {
  id: string
  name: string
  description: string | null
  price: number
  priceType: "PER_NIGHT" | "PER_STAY" | "PER_PERSON"
  icon: string | null
  available: boolean
  roomTypes: Array<{ roomType: RoomTypeOption }>
  _count: {
    roomTypes: number
    reservationExtras: number
  }
}

interface ExtraFormState {
  name: string
  description: string
  price: string
  priceType: "PER_NIGHT" | "PER_STAY" | "PER_PERSON"
  icon: string
  available: boolean
  roomTypeIds: string[]
}

const EMPTY_FORM: ExtraFormState = {
  name: "",
  description: "",
  price: "0",
  priceType: "PER_STAY",
  icon: "",
  available: true,
  roomTypeIds: [],
}

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<ExtraItem[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ExtraFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchExtras()
  }, [])

  async function fetchExtras() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/extras")
      const data = await response.json()
      setExtras(data.extras || [])
      setRoomTypes(data.roomTypes || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function updateForm<K extends keyof ExtraFormState>(key: K, value: ExtraFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleRoomType(roomTypeId: string) {
    setForm((prev) => ({
      ...prev,
      roomTypeIds: prev.roomTypeIds.includes(roomTypeId)
        ? prev.roomTypeIds.filter((id) => id !== roomTypeId)
        : [...prev.roomTypeIds, roomTypeId],
    }))
  }

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setModalOpen(true)
  }

  function openEditModal(extra: ExtraItem) {
    setEditingId(extra.id)
    setForm({
      name: extra.name,
      description: extra.description || "",
      price: String(extra.price),
      priceType: extra.priceType,
      icon: extra.icon || "",
      available: extra.available,
      roomTypeIds: extra.roomTypes.map(({ roomType }) => roomType.id),
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

    const endpoint = editingId ? `/api/admin/extras/${editingId}` : "/api/admin/extras"
    const method = editingId ? "PATCH" : "POST"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          priceType: form.priceType,
          icon: form.icon.trim() || null,
          available: form.available,
          roomTypeIds: form.roomTypeIds,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setFormError(data?.error || "No se pudo guardar el extra")
        return
      }

      await fetchExtras()
      closeModal()
    } catch (error) {
      console.error(error)
      setFormError("No se pudo guardar el extra")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(extra: ExtraItem) {
    const confirmed = window.confirm(`¿Eliminar el extra ${extra.name}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/extras/${extra.id}`, { method: "DELETE" })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        window.alert(data?.error || "No se pudo eliminar el extra")
        return
      }

      await fetchExtras()
    } catch (error) {
      console.error(error)
      window.alert("No se pudo eliminar el extra")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Extras</h1>
          <p className="font-sans text-sm text-slate-500">Gestiona add-ons, upsells y su disponibilidad comercial</p>
        </div>
        <Button variant="gold" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Nuevo extra
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="card" className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {extras.map((extra) => (
            <div key={extra.id} className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-gold-500" />
                    <p className="font-serif text-xl font-semibold text-navy-900">{extra.name}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={extra.available ? "success" : "danger"}>{extra.available ? "Disponible" : "Oculto"}</Badge>
                    <Badge variant="gold">S/ {extra.price.toFixed(2)}</Badge>
                    <Badge variant="default">{extra.priceType}</Badge>
                  </div>
                </div>
              </div>

              <p className="mt-4 font-sans text-sm text-slate-600 min-h-10">{extra.description || "Sin descripción"}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {extra.roomTypes.map(({ roomType }) => (
                  <Badge key={roomType.id} variant="info">{roomType.name}</Badge>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 font-sans text-xs text-slate-500">
                <p>Tipos vinculados: <span className="font-bold text-navy-900">{extra._count.roomTypes}</span></p>
                <p>Usado en reservas: <span className="font-bold text-navy-900">{extra._count.reservationExtras}</span></p>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEditModal(extra)}>
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => handleDelete(extra)}>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Editar extra" : "Nuevo extra"} size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
            <Input label="Icono Lucide" value={form.icon} onChange={(e) => updateForm("icon", e.target.value)} placeholder="Coffee" />
            <Input label="Precio" type="number" min={0} step="0.01" value={form.price} onChange={(e) => updateForm("price", e.target.value)} required />
            <div className="space-y-1">
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de precio</label>
              <select value={form.priceType} onChange={(e) => updateForm("priceType", e.target.value as ExtraFormState["priceType"])} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20">
                <option value="PER_STAY">Por estadía</option>
                <option value="PER_NIGHT">Por noche</option>
                <option value="PER_PERSON">Por persona</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Descripción</label>
            <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-ivory-200 bg-ivory-50 px-4 py-3 font-sans text-sm text-navy-900">
            <input type="checkbox" checked={form.available} onChange={(e) => updateForm("available", e.target.checked)} />
            Extra disponible para venta
          </label>

          <div className="space-y-2">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Asignar a tipos de habitación</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {roomTypes.map((roomType) => (
                <label key={roomType.id} className="flex items-center gap-3 rounded-lg border border-ivory-200 px-4 py-3 font-sans text-sm text-navy-900">
                  <input type="checkbox" checked={form.roomTypeIds.includes(roomType.id)} onChange={() => toggleRoomType(roomType.id)} />
                  {roomType.name}
                </label>
              ))}
            </div>
          </div>

          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 font-sans text-sm text-rose-700">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="gold" loading={submitting}>{editingId ? "Guardar cambios" : "Crear extra"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}