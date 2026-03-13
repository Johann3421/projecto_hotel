"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react"

interface RoomTypeOption {
  id: string
  name: string
}

interface SeasonalPriceItem {
  id: string
  name: string
  startDate: string
  endDate: string
  multiplier: number
  roomTypeId: string
  roomType: RoomTypeOption
}

interface PricingFormState {
  name: string
  startDate: string
  endDate: string
  multiplier: string
  roomTypeId: string
}

const EMPTY_FORM: PricingFormState = {
  name: "",
  startDate: "",
  endDate: "",
  multiplier: "1.20",
  roomTypeId: "",
}

export default function AdminPricingPage() {
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPriceItem[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PricingFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSeasonalPrices()
  }, [])

  async function fetchSeasonalPrices() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/seasonal-prices")
      const data = await response.json()
      setSeasonalPrices(data.seasonalPrices || [])
      setRoomTypes(data.roomTypes || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function updateForm<K extends keyof PricingFormState>(key: K, value: PricingFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreateModal() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, roomTypeId: roomTypes[0]?.id || "" })
    setFormError("")
    setModalOpen(true)
  }

  function openEditModal(price: SeasonalPriceItem) {
    setEditingId(price.id)
    setForm({
      name: price.name,
      startDate: price.startDate.slice(0, 10),
      endDate: price.endDate.slice(0, 10),
      multiplier: String(price.multiplier),
      roomTypeId: price.roomTypeId,
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

    const endpoint = editingId ? `/api/admin/seasonal-prices/${editingId}` : "/api/admin/seasonal-prices"
    const method = editingId ? "PATCH" : "POST"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          multiplier: Number(form.multiplier),
          roomTypeId: form.roomTypeId,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setFormError(data?.error || "No se pudo guardar la tarifa")
        return
      }

      await fetchSeasonalPrices()
      closeModal()
    } catch (error) {
      console.error(error)
      setFormError("No se pudo guardar la tarifa")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(price: SeasonalPriceItem) {
    const confirmed = window.confirm(`¿Eliminar la tarifa ${price.name}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/seasonal-prices/${price.id}`, { method: "DELETE" })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        window.alert(data?.error || "No se pudo eliminar la tarifa")
        return
      }

      await fetchSeasonalPrices()
    } catch (error) {
      console.error(error)
      window.alert("No se pudo eliminar la tarifa")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Tarifas estacionales</h1>
          <p className="font-sans text-sm text-slate-500">Multiplicadores por temporada y campañas comerciales</p>
        </div>
        <Button variant="gold" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Nueva tarifa
        </Button>
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-80" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ivory-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ivory-200 bg-ivory-50">
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Temporada</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Vigencia</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Multiplicador</th>
                <th className="px-4 py-3 text-right text-xs font-sans font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seasonalPrices.map((price) => (
                <tr key={price.id} className="border-b border-ivory-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-gold-500" />
                      <span className="font-sans text-sm font-semibold text-navy-900">{price.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="info">{price.roomType.name}</Badge></td>
                  <td className="px-4 py-3 font-sans text-sm text-slate-600">{new Date(price.startDate).toLocaleDateString("es-PE")} - {new Date(price.endDate).toLocaleDateString("es-PE")}</td>
                  <td className="px-4 py-3 font-sans text-sm font-bold text-navy-900">x{price.multiplier.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(price)}>
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(price)}>
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Editar tarifa" : "Nueva tarifa"} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />

          <div className="space-y-1">
            <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de habitación</label>
            <select value={form.roomTypeId} onChange={(e) => updateForm("roomTypeId", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" required>
              <option value="" disabled>Selecciona un tipo</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Inicio" type="date" value={form.startDate} onChange={(e) => updateForm("startDate", e.target.value)} required />
            <Input label="Fin" type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} required />
          </div>

          <Input label="Multiplicador" type="number" min={0.1} max={10} step="0.01" value={form.multiplier} onChange={(e) => updateForm("multiplier", e.target.value)} required />

          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 font-sans text-sm text-rose-700">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="gold" loading={submitting}>{editingId ? "Guardar cambios" : "Crear tarifa"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}