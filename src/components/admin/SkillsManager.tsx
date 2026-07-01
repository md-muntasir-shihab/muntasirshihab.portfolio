import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface SkillItem {
  name: string
  level: number
  cat: string
}

export default function SkillsManager({ lang }: { lang: Lang }) {
  const { skills, tools, updateSkills, updateTools } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<SkillItem>({
    name: "",
    level: 80,
    cat: "design",
  })

  const [newTool, setNewTool] = useState("")

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem({ ...skills[index] })
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      name: "",
      level: 80,
      cat: "design",
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.name.trim()) {
      alert(t("Skill name is required!", "দক্ষতার নাম পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...skills]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateSkills(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this skill?", "আপনি কি নিশ্চিত যে আপনি এই দক্ষতাটি মুছতে চান?", lang))) return
    const updatedList = skills.filter((_, i) => i !== index)
    await updateSkills(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...skills]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= skills.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateSkills(updatedList)
  }

  // --- Tools Operations ---
  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTool.trim()) return
    if (tools.includes(newTool.trim())) {
      alert(t("Tool already exists!", "এই টুলটি ইতিমধ্যে রয়েছে!", lang))
      return
    }
    const updatedTools = [...tools, newTool.trim()]
    await updateTools(updatedTools)
    setNewTool("")
  }

  const handleRemoveTool = async (toolToRemove: string) => {
    const updatedTools = tools.filter((t) => t !== toolToRemove)
    await updateTools(updatedTools)
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Skills Section */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-[20px] font-[720] tracking-[-0.015em]">{t("Skills", "মূল দক্ষতা", lang)}</div>
            {editingIdx === null && (
              <button
                onClick={handleStartAdd}
                className="px-3 h-8 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[12px] flex items-center gap-1 cursor-pointer transition hover:brightness-110"
              >
                <Plus size={14} /> {t("Add New", "নতুন যোগ", lang)}
              </button>
            )}
          </div>

          {editingIdx !== null ? (
            <div className="glass rounded-[18px] p-5 space-y-4">
              <div className="text-[14.5px] font-[700] text-[#e7b84b]">
                {isNew ? t("Add New Skill", "নতুন দক্ষতা যোগ করুন", lang) : t("Edit Skill", "দক্ষতা সংশোধন করুন", lang)}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] text-[#9aa0ad]">{t("Skill Name", "দক্ষতার নাম", lang)}</label>
                  <input
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    className="w-full mt-[5px] px-3 h-[38px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#9aa0ad]">{t("Skill Category", "ক্যাটাগরি", lang)}</label>
                  <select
                    value={currentItem.cat}
                    onChange={(e) => setCurrentItem({ ...currentItem, cat: e.target.value })}
                    className="w-full mt-[5px] px-3 h-[38px] rounded-[8px] bg-[#1a1a24] border border-white/[0.1] text-[13.5px] text-[#e8e9ef] outline-none"
                  >
                    <option value="design">{t("Graphic Design & Video", "গ্রাফিক ডিজাইন ও ভিডিও", lang)}</option>
                    <option value="stats">{t("Statistics & Research", "পরিসংখ্যান ও গবেষণা", lang)}</option>
                    <option value="dev">{t("Web Development", "ওয়েব ডেভেলপমেন্ট", lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-[#9aa0ad] flex justify-between">
                    <span>{t("Proficiency Level", "দক্ষতা মাত্রা", lang)}</span>
                    <span className="text-yellow-500 font-mono">{currentItem.level}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentItem.level}
                    onChange={(e) => setCurrentItem({ ...currentItem, level: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#e7b84b] mt-2"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-white/[0.08] flex gap-2">
                <button
                  onClick={handleSaveItem}
                  className="px-4 h-8 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[12.5px] cursor-pointer"
                >
                  {t("Save", "সংরক্ষণ", lang)}
                </button>
                <button
                  onClick={() => {
                    setEditingIdx(null)
                    setIsNew(false)
                  }}
                  className="px-4 h-8 rounded-full bg-white/[0.06] text-[#d2d5de] font-[650] text-[12.5px] cursor-pointer"
                >
                  {t("Cancel", "বাতিল", lang)}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-[18px] p-4 space-y-2">
              {skills.length === 0 ? (
                <div className="text-center py-4 text-[13px] text-[#7e8391]">{t("No skills added yet.", "এখনো কোনো দক্ষতা যোগ করা হয়নি।", lang)}</div>
              ) : (
                skills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.015] border border-white/[0.04]"
                  >
                    <div>
                      <span className="font-[600] text-[13.5px] text-[#e8e9ef]">{sk.name}</span>
                      <span className="text-[10px] px-1.5 py-[2px] rounded-full bg-white/5 border border-white/10 text-[#9aa0ad] ml-2 capitalize">
                        {sk.cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-yellow-500 font-mono mr-2">{sk.level}%</span>
                      <button
                        onClick={() => handleStartEdit(idx)}
                        className="p-1.5 rounded-full hover:bg-white/5 text-[#e7c879]"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white/[0.02] disabled:opacity-30"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === skills.length - 1}
                        className="p-1 rounded bg-white/[0.02] disabled:opacity-30"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 rounded-full hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tools Section */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-[20px] font-[720] tracking-[-0.015em]">
            {t("Tools & Technologies", "টুলস ও টেকনোলজি", lang)}
          </div>
          
          <div className="glass rounded-[18px] p-5 space-y-4">
            <form onSubmit={handleAddTool} className="flex gap-2">
              <input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                placeholder={t("Add tool (e.g. Docker)", "টুল যোগ করুন (যেমন Docker)", lang)}
                className="flex-1 px-3 h-[38px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px] outline-none"
              />
              <button
                type="submit"
                className="px-4 h-[38px] rounded-[8px] bg-[#e7b84b] text-[#1a1410] font-[650] text-[12.8px] cursor-pointer"
              >
                {t("Add", "যোগ", lang)}
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {tools.length === 0 ? (
                <div className="text-[12.5px] text-[#7e8391] py-2">{t("No tools tags added yet.", "এখনো কোনো টুলস ট্যাগ যোগ করা হয়নি।", lang)}</div>
              ) : (
                tools.map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[12.5px] text-[#d2d5de]"
                  >
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="text-red-400 hover:text-red-300 ml-1 font-[700] text-[11px]"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
