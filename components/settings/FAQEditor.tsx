"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveFaq, removeFaq } from "@/app/(dashboard)/settings/actions"

interface Faq {
  id: string
  question: string
  answer: string
}

interface Props {
  faqs: Faq[]
}

export default function FAQEditor({ faqs: initialFaqs }: Props) {
  const [faqs, setFaqs] = useState(initialFaqs)
  const [adding, setAdding] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!question || !answer) return
    setSaving(true)

    const formData = new FormData()
    formData.set("question", question)
    formData.set("answer", answer)
    const result = await saveFaq(formData)

    if (result.success) {
      setFaqs((prev) => [...prev, { id: Date.now().toString(), question, answer }])
      setQuestion("")
      setAnswer("")
      setAdding(false)
    }
    setSaving(false)
  }

  async function handleDelete(faqId: string) {
    const formData = new FormData()
    formData.set("faq_id", faqId)
    await removeFaq(formData)
    setFaqs((prev) => prev.filter((f) => f.id !== faqId))
  }

  return (
    <div className="space-y-4">
      {faqs.length === 0 && !adding && (
        <p className="text-sm text-zinc-400 py-4 text-center border border-dashed border-zinc-200 rounded-md">
          No FAQs yet. Add your first one below.
        </p>
      )}

      {faqs.map((faq) => (
        <div key={faq.id} className="border border-zinc-200 rounded-md p-4 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm">{faq.question}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-red-500 shrink-0"
              onClick={() => handleDelete(faq.id)}
            >
              Remove
            </Button>
          </div>
          <p className="text-sm text-zinc-500">{faq.answer}</p>
        </div>
      ))}

      {adding ? (
        <div className="border border-zinc-200 rounded-md p-4 space-y-3">
          <Input
            placeholder="Question e.g. What are your opening hours?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Textarea
            placeholder="Answer e.g. We are open 9am–6pm Saturday to Thursday."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save FAQ"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>+ Add FAQ</Button>
      )}
    </div>
  )
}
